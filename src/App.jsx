import { ModalBody, Row, Button, Input } from 'reactstrap';
import { useEffect, useState } from 'react';
import { Loader } from './components/Loader';
import { useAccount, useConnect, useNetwork } from 'wagmi';
import { ethers } from 'ethers';
import useEthereumContract from './hooks/useEthereumContract';
import { StyledButton, StyledWrapper } from './styles';
import ModalComponent from './components/Modal';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState('#');
  const [isValidating, setIsValidating] = useState(true);
  const [supply, setSupply] = useState(0);

  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [{ data: networkData }, switchNetwork] = useNetwork();

  const [useContract] = useEthereumContract();

  const [totalMinted, setTotalMinted] = useState(0);

  function toggleModal() {
    setShowModal(!showModal);
  }

  function mintNft() {
    if (!supply) {
      alert('please specify how much you want to mint');
      return;
    }

    if (totalMinted === 2) {
      alert('exceeded whitelist mint quota.');
      return;
    }
    toggleModal();
    progressNft();
  }

  const fetchMints = async () => {
    try {
      if (useContract) {
        const isAllowed = await useContract.isAllowed(
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          accountData?.address,
        );
        setIsWhitelisted(isAllowed);

        const ownedNfts = await useContract.owned(accountData?.address);
        setTotalMinted(ownedNfts.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(totalMinted);

  const progressNft = async () => {
    const price = (0.04 * supply) / 2;

    try {
      setIsValidating(true);
      if (useContract) {
        console.log('Going to pop wallet now to pay gas...');
        let tx = await useContract.mint(
          supply,
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          { gasLimit: 300000, value: ethers.utils.parseEther(String(price)) },
        );

        const receipt = await tx.wait();

        if (receipt.status !== 1) {
          setShowModal(false);
          alert('Minting failed');
          return;
        }

        console.log(receipt);
      } else {
        alert('Transaction failed! Please try again');
      }
    } catch (error) {
      console.log(error);
      setShowModal(false);
      alert('Minting failed');
    }
  };

  useEffect(() => {
    if (accountData?.address) {
      fetchMints();
    }
  }, [data]);

  const renderOption = () => {
    const array = [];
    let totalLimit = 2;

    if (isWhitelisted) {
      totalLimit = 20;
    }

    for (let index = 1; index <= totalLimit; index++) {
      array[index - 1] = index;
    }

    return array.map((i) => (
      <option value={i} key={i}>
        {i}
      </option>
    ));
  };

  return (
    <div className="container">
      <StyledWrapper>
        <div>
          {!accountData &&
            data?.connectors?.map((connector) => (
              <Button
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => connect(connector)}
              >
                Connect Wallet
                {!connector.ready && ' (unsupported)'}
              </Button>
            ))}

          {accountData && (
            <div className="d-flex flex-column gap-4">
              <Button color="light" onClick={disconnect}>
                {accountData?.ens?.name ||
                  `${accountData?.address.slice(0, 6)}...
              ${accountData?.address.slice(-4)}`}
              </Button>
              {switchNetwork && networkData?.chain?.id !== 4 && (
                <Button color="info" onClick={() => switchNetwork(4)}>
                  Switch to Rinkeby
                </Button>
              )}
            </div>
          )}

          {error && <div>{error?.message ?? 'Failed to connect'}</div>}
        </div>
      </StyledWrapper>
      {accountData ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="d-flex flex-column gap-4">
            <Input
              type="select"
              min="1"
              max="6"
              step="1"
              placeholder="Number of token to mint"
              onChange={(e) => setSupply(Number(e.target.value))}
            >
              <option value={''}>{'Number Of Token To Mint'}</option>
              {renderOption()}
            </Input>
            <StyledButton
              id="mint"
              onClick={mintNft}
              disabled={networkData?.chain?.id !== 4}
            >
              Mint
            </StyledButton>
            <p className="text-center">
              🔥 Your address have minted {totalMinted} PepeDoods 🔥
            </p>
          </div>

          <ModalComponent
            title={'Congrats!'}
            isOpen={showModal}
            toggleModal={() => toggleModal()}
          >
            <ModalBody>
              {isValidating ? (
                <>
                  <p className="text-center">
                    <a href={etherscanLink} target="_blank" rel="noreferrer">
                      Your transaction{' '}
                    </a>
                    is being validated in the mainnet.
                  </p>
                  <div className="loading-center">
                    <Loader />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center">Minted!</p>
                  <Row>Items here</Row>
                </>
              )}
            </ModalBody>
          </ModalComponent>
        </div>
      ) : (
        <div className="flex flex-column align-items-center justify-content-center text-center pt-5">
          <p>pls connect your wallet to get started 💖</p>
        </div>
      )}
    </div>
  );
}

export default App;
