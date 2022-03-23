import { ModalHeader } from 'reactstrap';
import { StyledModal } from '../styles';

const ModalComponent = ({ isOpen, toggleModal, title, children }) => {
  return (
    <StyledModal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>{title}</ModalHeader>
      {children}
    </StyledModal>
  );
};

export default ModalComponent;
