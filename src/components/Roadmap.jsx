import styled from 'styled-components';

const StyledRoadmap = styled.div`
  display: flex;
  justify-content: space-around;
  border: 4px solid #fff;
  border-radius: 10px;
  background-color: hsla(0, 100%, 100%, 0.5);
  align-items: center;
  width: 70%;
  margin: 0 auto;
`;

const StyledImg = styled.img`
  max-width: 100%;
  width: 10rem;
  height: auto;
`;

const StyledRoadmapDescription = styled.div`
  text-align: left;
`;

const Roadmap = ({ src, alt, title, desc }) => {
  return (
    <StyledRoadmap>
      <StyledImg src={src} alt="pepedoods" />

      <StyledRoadmapDescription>
        <h4>{title}</h4>
        <p>{desc}</p>
      </StyledRoadmapDescription>
    </StyledRoadmap>
  );
};

export default Roadmap;
