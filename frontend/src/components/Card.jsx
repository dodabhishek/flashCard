import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-details">
          <p className="text-title">Card Title</p>
          <p className="text-body">Card Details</p>
        </div>
        <a className="card-button" href="#link">More info</a>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 190px;
    height: 254px;
    border-radius: 20px;
    background: #f5f5f5;
    position: relative;
    padding: 1.8rem;
    border: 2px solid #c3c6ce;
    -webkit-transition: 0.5s ease-out;
    transition: 0.5s ease-out;
    overflow: visible;
  }

  .card-details {
    color: rgb(162, 0, 255);
    height: 100%;
    gap: .5em;
    display: grid;
    place-content: center;
    font-family: 'Courier New', Courier, monospace;
  }

  .card-button {
    text-decoration: none;
    text-align: center;
    -webkit-transform: translate(-50%, 125%);
    -ms-transform: translate(-50%, 125%);
    transform: translate(-50%, 125%);
    width: 70%;
    border-radius: 1rem;
    border: none;
    background-color: #6c00f8;
    color: #fff;
    font-size: 1rem;
    padding: .5rem 1rem;
    position: absolute;
    left: 50%;
    bottom: 0;
    opacity: 0;
    -webkit-transition: 0.3s ease-out;
    transition: 0.3s ease-out;
    cursor: pointer;
    font-family: 'Courier New', Courier, monospace;
  }

  .text-body {
    color: rgb(134, 134, 134);
  }

  /*Text*/
  .text-title {
    font-size: 1.5em;
    font-weight: bold;
  }

  /*Hover*/
  .card:hover {
    border-color: #6c00f8;
    -webkit-box-shadow: 10px 5px 18px 0 rgba(255, 255, 255, 0.877);
    box-shadow: 10px 5px 18px 0 rgba(255, 255, 255, 0.877);
  }

  .card:hover .card-button {
    -webkit-transform: translate(-50%, 50%);
    -ms-transform: translate(-50%, 50%);
    transform: translate(-50%, 50%);
    opacity: 1;
  }`;

export default Card;
