import React from 'react';
import styled from 'styled-components';

const DeckMenu = ({ onView, onAddSubdeck, onDelete, onClose }) => {
  return (
    <StyledWrapper>
      <div className="input">
        <button className="value" onClick={onView}>
          View Cards
        </button>
        <button className="value" onClick={onAddSubdeck}>
          Add Sub-deck
        </button>
        <button className="value" onClick={onDelete}>
          Delete
        </button>
        <button className="value" onClick={onClose}>
          Close
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input {
    display: flex;
    flex-direction: column;
    width: 200px;
    background-color: #0D1117;
    justify-content: center;
    border-radius: 5px;
  }

  .value {
    background-color: transparent;
    border: none;
    padding: 10px;
    color: white;
    display: flex;
    position: relative;
    gap: 5px;
    cursor: pointer;
    border-radius: 4px;
  }

  .value:not(:active):hover,
  .value:focus {
    background-color: #21262C;
  }

  .value:focus,
  .value:active {
    background-color: #1A1F24;
    outline: none;
  }

  .value::before {
    content: "";
    position: absolute;
    top: 5px;
    left: -10px;
    width: 5px;
    height: 80%;
    background-color: #2F81F7;
    border-radius: 5px;
    opacity: 0;
  }

  .value:focus::before,
  .value:active::before {
    opacity: 1;
  }

  .value svg {
    width: 15px;
  }

  .input:hover > :not(.value:hover) {
    transition: 300ms;
    filter: blur(1px);
    transform: scale(0.95,0.95);
  }
`;

export default DeckMenu; 