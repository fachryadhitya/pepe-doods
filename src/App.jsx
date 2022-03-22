import styled from 'styled-components';
import { Modal, ModalHeader, ModalBody, Row } from 'reactstrap';
import { useEffect, useState } from 'react';
import { Loader } from './components/Loader';

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledModal = styled(Modal)`
  .loading-center {
    display: flex;
    justify-content: center;
  }
`;

function App() {
  const [showModal, setShowModal] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState('#');
  const [isValidating, setIsValidating] = useState(true);

  function toggleModal() {
    setShowModal(!showModal);
  }

  useEffect(() => {
    toggleModal();
    setTimeout(() => {
      setEtherscanLink('https://etherscan.io');
      setIsValidating(false);
    }, 2000);
  }, []);

  return (
    <StyledWrapper>
      <input
        type="number"
        min="1"
        max="6"
        step="1"
        placeholder="Number of token to mint"
      />
      <button id="mint">Mint</button>
      <StyledModal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Congratulations 🎉🎉</ModalHeader>
        <ModalBody>
          {isValidating ? (
            <>
              <p class="text-center">
                <a href={etherscanLink} target="_blank" rel="noreferrer">
                  Your transaction
                </a>{' '}
                is being validated in the mainnet.
              </p>
              <div class="loading-center">
                <Loader />
              </div>
            </>
          ) : (
            <>
              <p className="text-center">Minted!</p>
              <Row>{/* Items here */}</Row>
            </>
          )}
        </ModalBody>
      </StyledModal>
    </StyledWrapper>
  );
}

export default App;
