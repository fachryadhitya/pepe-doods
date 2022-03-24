import styled from 'styled-components';
import { Button, Input, ModalBody, Row } from 'reactstrap';

import { Fragment, useEffect, useState } from 'react';
import { Loader } from './components/Loader';
import { ethers } from 'ethers';
import useEthereumContract from './hooks/useEthereumContract';
import { StyledButton } from './styles';
import ModalComponent from './components/Modal';
import { networks } from './utils/network';
import Roadmap from './components/Roadmap';

const StyledLayout = styled.div`
  min-height: 100vh;
  padding-bottom: 4rem;
  background: linear-gradient(hsla(0, 0%, 100%, 0.4), hsla(0, 0%, 100%, 0.4)),
    url(https://pepedoods.com/background.d9ff9cd7.png);
  background-size: cover;
  background-position: bottom;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 1rem 1rem;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.8);
  margin-bottom: 1rem;
`;

const StyledIntroduction = styled.div`
    display: flex;
    justify-content: center;
    align-items-center;
    flex-direction: column;
    text-align: center;
    max-width: 1028px;
    margin: 0 auto;
    gap: 2rem;
`;

const StyledImg = styled.img`
  max-width: 100%;
  width: 10rem;
  height: auto;
`;

const StyledAbout = styled.div`
  background: lightgrey;
  color: black;
  font-weght: 700;
  padding: 1rem;
  border-radius: 10px;
  h3 {
    text-decoration: underline;
  }
`;

const StyledFaq = styled.div`
  margin: 0 auto;
  width: 70%;
  text-align: left;
  background: lightgrey;
  padding: 1rem;
  border-radius: 10px;
`;

const StyledMint = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  gap: 2rem;
  align-items: center;
`;

const PepeDoods = () => {
  const [showModal, setShowModal] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState('');

  const [isValidating, setIsValidating] = useState(false);
  const [supply, setSupply] = useState(0);

  const [useContract, eth] = useEthereumContract();
  const [totalMinted, setTotalMinted] = useState(0);
  const [nftId, setNftId] = useState([]);
  const [network, setNetwork] = useState('');
  const [acc, setAcc] = useState('');

  const [modalCollection, setModalCollection] = useState(false);

  function toggleModal() {
    setShowModal(!showModal);
  }

  function mintNft() {
    if (!supply) {
      alert('please specify how much you want to mint');
      return;
    }

    // if (totalMinted >= 2) {
    //   alert('exceeded whitelist mint quota..');
    //   return;
    // }
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

            const ipfsJson = tokenByIndex?.replace(
              'ipfs://',
              'https://ipfs.io/ipfs/',
            );

            const data = await fetch(ipfsJson);
            const result = await data.text();

            let img;

            try {
              const dataIpfs = JSON.parse(result);
              if (dataIpfs?.image_url) {
                img = dataIpfs?.image_url?.replace(
                  'ipfs://',
                  'https://ipfs.io/ipfs/',
                );
              }
            } catch (error) {
              img = ipfsJson;
            }

            return {
              id: lastIndex.split('.')[0],
              img,
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
    if (network === 'Rinkeby' && acc) {
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
    <StyledLayout>
      <StyledHeader>
        <h1>PepeDoods</h1>
        <div className="d-flex flex-column gap-4">
          <Button onClick={disconnect}>
            {acc
              ? `${acc?.slice(0, 6)}...
              ${acc?.slice(-4)}`
              : 'Wallet Addy'}
          </Button>
          {network !== 'Rinkeby' && (
            <Button color="info" onClick={switchNetwork}>
              Connect To Rinkeby
            </Button>
          )}
        </div>
      </StyledHeader>

      <StyledIntroduction>
        <StyledMint>
          <StyledImg
            src="https://pepedoods.com/2.ee1b87c2.png"
            alt="pepedoods"
          />

          {!acc && <Button onClick={connectWallet}>Mint a PepeDoods</Button>}
          {acc && (
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

              <StyledButton
                className="text-black"
                onClick={() => setModalCollection(!modalCollection)}
              >
                View Your {totalMinted} PepeDoods Collection
              </StyledButton>
            </div>
          )}
        </StyledMint>
        <StyledAbout>
          <h3>About PepeDoods</h3>
          <p>
            PepeDoods is a community-driven collectible NFT project to !vibe.
            PepeDoods are created with hundreds of traits with maximum possible
            permutations in the millions for all traits like head, hair, body,
            background. However, only 8888 unique PepeDoods made it to the final
            collection published on the Ethereum blockchain. Holding a PepeDood
            allows you to be part of an awesome community who !vibe in the
            metaverse. Join our Discord!
          </p>
        </StyledAbout>

        <h3>Roadmap</h3>

        <Roadmap
          src="https://pepedoods.com/whitelist-icecream.d778d80d.png"
          alt="pepedoods"
          title={'Project Kick-off'}
          desc="Whitelist all Doodles and Pepe NFT projects holders for private
            sales."
        />

        <h3>Faqs</h3>

        <StyledFaq>
          <h4>Wen Airdrop?</h4>
          <p>No airdrop ser</p>
        </StyledFaq>
      </StyledIntroduction>

      {modalCollection && (
        <ModalComponent
          title={`Your PepeDoods Collection`}
          isOpen={modalCollection}
          toggleModal={() => setModalCollection(!modalCollection)}
        >
          <div className="d-flex flex-column p-4 justify-content-center align-items-center gap-3">
            <span>pls wait because ipfs takes long time to load</span>
            {nftId?.map((item) => (
              <Fragment key={item?.id}>
                <StyledImg src={item?.img} alt="nft-collection" />
                <a
                  href={`https://testnets.opensea.io/assets/0xbe4f068501de3ae5fd860ec153984adfb494074d/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenSea link
                </a>
              </Fragment>
            ))}
          </div>
        </ModalComponent>
      )}

      {showModal && (
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
                  Minted! see your transaction <a href={etherscanLink}>here!</a>
                </p>
                <p>Aaaaand here is your owned NFTs! 💫</p>
                <Row className="d-flex flex-column justify-content-center align-items-center gap-4">
                  {nftId?.map((item, index) => (
                    <Fragment key={item?.id}>
                      <StyledImg src={item?.img} alt="nft-collection" />
                      <a
                        href={`https://testnets.opensea.io/assets/0xbe4f068501de3ae5fd860ec153984adfb494074d/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        OpenSea link
                      </a>
                    </Fragment>
                  ))}
                </Row>
              </div>
            )}
          </ModalBody>
        </ModalComponent>
      )}
    </StyledLayout>
  );
};

export default PepeDoods;
