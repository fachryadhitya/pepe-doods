import contractABI from '../contracts/Contract.json';
import { ethers } from 'ethers';

const useEthereumContract = () => {
  const CONTRACT_ADDRESS = '0xbe4F068501dE3ae5Fd860eC153984ADfb494074D';

  const { ethereum } = window;

  if (!ethereum) {
    alert('Get metamask -> https://metamask.io/');
    return;
  }

  let contractTest;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  contractTest = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

  return [contractTest, ethereum];
};

export default useEthereumContract;
