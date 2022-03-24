import { ModalBody, Row, Button, Input } from 'reactstrap';
import { useEffect, useState } from 'react';
import { Loader } from './components/Loader';
import { ethers } from 'ethers';
import useEthereumContract from './hooks/useEthereumContract';
import { StyledButton, StyledWrapper } from './styles';
import ModalComponent from './components/Modal';
import { networks } from './utils/network';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState('');

  const [isValidating, setIsValidating] = useState(false);
  const [supply, setSupply] = useState(0);

  const [useContract, eth] = useEthereumContract();
  const [totalMinted, setTotalMinted] = useState(0);
  const [nftId, setNftId] = useState([]);
  const [network, setNetwork] = useState('');
  const [acc, setAcc] = useState('');

  function toggleModal() {
    setShowModal(!showModal);
  }

  function mintNft() {
    if (!supply) {
      alert('please specify how much you want to mint');
      return;
    }

    if (totalMinted >= 2) {
      alert('exceeded whitelist mint quota.');
      return;
    }
    toggleModal();
    progressNft();
  }

  const checkIfWallexExisted = async () => {
    const accounts = await eth.request({ method: 'eth_accounts' });

    if (accounts.length > 0) {
      console.log(accounts);
      const account = accounts[0];
      setAcc(account);
    } else {
      console.log('no authorized');
    }

    const chainId = await eth.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    eth.on('chainChanged', handleChainChanged);

    function handleChainChanged(_chainId) {
      setNetwork(networks[_chainId]);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await eth.request({
        method: 'eth_requestAccounts',
      });

      setAcc(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async () => {
    try {
      const accounts = await eth
        .request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        })
        .then(() =>
          eth.request({
            method: 'eth_requestAccounts',
          }),
        );

      setAcc(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWallexExisted();
  }, []);

  const switchNetwork = async () => {
    if (eth) {
      try {
        // Try to switch to the Rinkeby testnet
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x4',
                  chainName: 'ETH',
                  rpcUrls: ['https://rinkeby.infura.io/v3/'],
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert(
        'MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html',
      );
    }
  };

  const fetchMints = async () => {
    try {
      if (useContract) {
        const ownedNfts = await useContract.owned(acc);
        setTotalMinted(ownedNfts.length);

        const tokenUri = await Promise.all(
          ownedNfts.map(async (item) => {
            const tokenByIndex = await useContract.tokenURI(item);
            const splittedToken = tokenByIndex.split('/');
            const lastIndex = splittedToken[splittedToken.length - 1];
            return {
              id: lastIndex.split('.')[0],
            };
          }),
        );

        setNftId(tokenUri);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (network === 'Rinkeby') {
      fetchMints();
    }
  }, [network, acc]);

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
        setEtherscanLink(
          `https://rinkeby.etherscan.io/tx/${receipt?.transactionHash}`,
        );
        fetchMints();
      } else {
        alert('Transaction failed! Please try again');
      }
    } catch (error) {
      console.log(error);
      setShowModal(false);
      alert('Minting failed');
    } finally {
      setIsValidating(false);
    }
  };

  const renderOption = () => {
    const array = [];
    let totalLimit = 2;

    /**
     * after whitelist period is ended, limit will be 20 per tx
     */

    // if (isWhitelisted) {
    //   totalLimit = 20;
    // }

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
          {!acc && <Button onClick={connectWallet}>Connect Wallet</Button>}

          {acc && (
            <div className="d-flex flex-column gap-4">
              <Button color="light" onClick={disconnect}>
                {`${acc?.slice(0, 6)}...
              ${acc?.slice(-4)}`}
              </Button>
              {network !== 'Rinkeby' && (
                <Button color="info" onClick={switchNetwork}>
                  Switch to Rinkeby
                </Button>
              )}
            </div>
          )}
        </div>
      </StyledWrapper>
      {acc ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="d-flex flex-column gap-4">
            <Input
              type="select"
              placeholder="Number of token to mint"
              onChange={(e) => setSupply(Number(e.target.value))}
              value={supply}
            >
              <option value={''}>{'Number Of Token To Mint'}</option>
              {renderOption()}
            </Input>
            <StyledButton
              id="mint"
              onClick={mintNft}
              disabled={network !== 'Rinkeby'}
            >
              Mint
            </StyledButton>
            <p className="text-center">
              🔥 Your address have minted {totalMinted} PepeDoods 🔥
            </p>
            <p className="mb-0">Collections: </p>
            {totalMinted > 0 && (
              <>
                <ul>
                  {nftId?.map((item, index) => (
                    <li key={item.id}>
                      <a
                        href={`https://testnets.opensea.io/assets/0xbe4f068501de3ae5fd860ec153984adfb494074d/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Collection {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
                    Your transaction is being validated in the mainnet. . .
                  </p>
                  <div className="loading-center">
                    <Loader />
                  </div>
                </>
              ) : (
                <div className="text-center d-flex justify-content-center flex-column align-items-center">
                  <p>
                    Minted! see your transaction{' '}
                    <a href={etherscanLink}>here!</a>
                  </p>
                  <p>Aaaaand here is your owned NFTs! 💫</p>
                  <Row>
                    <ul>
                      {nftId?.map((item, index) => (
                        <li key={item.id}>
                          <a
                            href={`https://testnets.opensea.io/assets/0xbe4f068501de3ae5fd860ec153984adfb494074d/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Collection {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Row>
                </div>
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
