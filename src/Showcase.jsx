import React from 'react';
import { ethers } from "ethers";
import { Link } from 'react-router-dom';
import { Button, Card, Modal, ModalHeader, ModalBody, Spinner, ListGroup, ListGroupItem, Badge, CardColumns } from 'reactstrap'

import abi from './utils/WavePortal.json'
/**
        * Create a letiable here that holds the contract address after you deploy!
        */
const contractAddress = "0x5E5571618b77CE56C297115340801C3e26dFaEA4";

let loaded = false;
const contractABI = abi.abi;
const PUZZLE_DIFFICULTY = 3;
const PUZZLE_HOVER_TINT = '#009900';
let _pieces;
let _puzzleWidth;
let _puzzleHeight;
let _pieceWidth;
let _pieceHeight;
let _currentPiece;
let _currentDropPiece;

let xoffset;
let yoffset;


let _stage;
let _canvas;

let _mouse;

class Showcase extends React.Component {
  componentDidMount() {

    localStorage.getItem('puzzle-image')

    let _img = new Image();
    _img.addEventListener('load', this.onImage, false);
    _img.src = localStorage.getItem('puzzle-image');

    this.setState(() => ({
      currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
      totalwaves: this.state && this.state.count,
      controlIsLoading: this.state && this.state.controlIsLoading,
      puzzleImg: _img,
      leaderboard: []
    }));

  }

  constructor(props) {
    super(props);


    this.state = {
      currentAccount: undefined,       // update the value of specific key
      totalwaves: 0,
      controlIsLoading: true
    }

    this.setCanvas = () => {
      _canvas = document.getElementById('canvas');
      _stage = _canvas.getContext('2d');
      _canvas.width = _puzzleWidth;
      _canvas.height = _puzzleHeight;
      _canvas.style.border = "1px solid black";

      var rect = _canvas.getBoundingClientRect();
      console.log(rect.top, rect.right, rect.bottom, rect.left);
      xoffset = 0;//rect.left;
      yoffset = 0;//rect.top;

    }
    this.initPuzzle = () => {
      _pieces = [];
      _mouse = { x: 0, y: 0 };
      _currentPiece = null;
      _currentDropPiece = null;
      _stage.drawImage(this.state && this.state.puzzleImg, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
      if (this.state && this.state.isWinner) {
      } else {
        this.createTitle("Click to Start Puzzle");
      }


      this.buildPieces();
    }
    this.createTitle = (msg) => {
      _stage.fillStyle = "#000000";
      _stage.globalAlpha = .4;
      _stage.fillRect(100, _puzzleHeight - 40, _puzzleWidth - 200, 40);
      _stage.fillStyle = "#FFFFFF";
      _stage.globalAlpha = 1;
      _stage.textAlign = "center";
      _stage.textBaseline = "middle";
      _stage.font = "20px Arial";
      _stage.fillText(msg, _puzzleWidth / 2, _puzzleHeight - 20);
    }
    this.buildPieces = () => {
      let i;
      let piece;
      let xPos = 0;
      let yPos = 0;
      for (i = 0; i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY; i++) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
          xPos = 0;
          yPos += _pieceHeight;
        }
      }

      if (this.state && this.state.isWinner) {
      } else {
        document.onmousedown = this.shufflePuzzle;
      }
    }
    this.shufflePuzzle = () => {
      _pieces = this.shuffleArray(_pieces);
      _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
      let i;
      let piece;
      let xPos = 0;
      let yPos = 0;
      for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        _stage.drawImage(this.state && this.state.puzzleImg, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
          xPos = 0;
          yPos += _pieceHeight;
        }
      }
      document.onmousedown = this.onPuzzleClick;
    }
    this.onPuzzleClick = (e) => {
      if (e.layerX || e.layerX == 0) {
        _mouse.x = e.layerX - xoffset;
        _mouse.y = e.layerY - yoffset;
      }
      else if (e.offsetX || e.offsetX == 0) {
        _mouse.x = e.offsetX - xoffset;
        _mouse.y = e.offsetY - yoffset;
      }
      _currentPiece = this.checkPieceClicked();
      if (_currentPiece != null) {
        _stage.clearRect(_currentPiece.xPos, _currentPiece.yPos, _pieceWidth, _pieceHeight);
        _stage.save();
        _stage.globalAlpha = .9;
        _stage.drawImage(this.state && this.state.puzzleImg, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
        _stage.restore();
        document.onmousemove = this.updatePuzzle;
        document.onmouseup = this.pieceDropped;
      }
    }
    this.checkPieceClicked = () => {
      let i;
      let piece;
      for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
          //PIECE NOT HIT
        }
        else {
          return piece;
        }
      }
      return null;
    }
    this.updatePuzzle = (e) => {
      _currentDropPiece = null;
      if (e.layerX || e.layerX == 0) {
        _mouse.x = e.layerX - xoffset;
        _mouse.y = e.layerY - yoffset;
      }
      else if (e.offsetX || e.offsetX == 0) {
        _mouse.x = e.offsetX - xoffset;
        _mouse.y = e.offsetY - yoffset;
      }
      _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
      let i;
      let piece;
      for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        if (piece == _currentPiece) {
          continue;
        }
        _stage.drawImage(this.state && this.state.puzzleImg, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if (_currentDropPiece == null) {
          if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
            //NOT OVER
          }
          else {
            _currentDropPiece = piece;
            _stage.save();
            _stage.globalAlpha = .4;
            _stage.fillStyle = PUZZLE_HOVER_TINT;
            _stage.fillRect(_currentDropPiece.xPos, _currentDropPiece.yPos, _pieceWidth, _pieceHeight);
            _stage.restore();
          }
        }
      }
      _stage.save();
      _stage.globalAlpha = .6;
      _stage.drawImage(this.state && this.state.puzzleImg, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
      _stage.restore();
      _stage.strokeRect(_mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
    }
    this.pieceDropped = () => {
      document.onmousemove = null;
      document.onmouseup = null;
      if (_currentDropPiece != null) {
        let tmp = { xPos: _currentPiece.xPos, yPos: _currentPiece.yPos };
        _currentPiece.xPos = _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;
      }
      this.resetPuzzleAndCheckWin();
    }
    this.resetPuzzleAndCheckWin = () => {
      _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
      let gameWin = true;
      let i;
      let piece;
      for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        _stage.drawImage(this.state && this.state.puzzleImg, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
          gameWin = false;
        }
      }
      if (gameWin) {
        this.setState(() => ({
          currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
          totalwaves: this.state && this.state.count,
          controlIsLoading: this.state && this.state.controlIsLoading,
          puzzleImg: this.state && this.state.puzzleImg,
          isWinner: true,
          leaderboard: this.state && this.state.leaderboard
        }));
        this.gameOver();
      }
    }
    this.gameOver = () => {
      document.onmousedown = null;
      document.onmousemove = null;
      document.onmouseup = null;
      this.initPuzzle();
    }

    this.shuffleArray = (o) => {
      for (let j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    }

    this.onImage = (e) => {
      _pieceWidth = Math.floor(this.state && this.state.puzzleImg.width / PUZZLE_DIFFICULTY)
      _pieceHeight = Math.floor(this.state && this.state.puzzleImg.height / PUZZLE_DIFFICULTY)
      _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
      _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;
      this.setCanvas();
      this.initPuzzle();
      console.log("setCanvas");
    }

    this.checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);

          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          let wavers = await wavePortalContract.getWavers();

          console.log("###############WAV ERS");

          let leaderboard = [];

          wavers.map(async (myValue) => {

            let waveInfo = await wavePortalContract.getWaverInfo(myValue);

            leaderboard.push(
              {
                address: myValue,
                wins: waveInfo.imageUrls.length,
                imageUrls: waveInfo.imageUrls
              }
            );

            console.log(leaderboard);

            this.setState(() => ({
              currentAccount: account,       // update the value of specific key
              totalwaves: count.toNumber(),

              controlIsLoading: false,
              leaderboard: leaderboard
            }));


          });



        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
        console.log(error);
      }
    }

    this.GetPuzzle = () => {
      let app_id = 'TbXA1vdNhqrLnkvFhrntbGzVs3TwdxpK7ggZWduvFfs'
      let url = 'https://api.unsplash.com/photos/random?client_id=' + app_id;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(json) {
          let src = json.urls.small;
          localStorage.setItem('puzzle-image', src)


        }
      });

    }

    this.GetRandomBackground = () => {
      let app_id = 'TbXA1vdNhqrLnkvFhrntbGzVs3TwdxpK7ggZWduvFfs'
      let url = 'https://api.unsplash.com/photos/random?client_id=' + app_id;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(json) {
          let src = json.urls.small;
          localStorage.setItem('recent-image', src)

          $('#showcase').css('background-image', 'url(' + localStorage.getItem('recent-image') + ')').css('background-size', 'cover');
        }
      });
    }

    this.connectWallet = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Connected", accounts[0]);

        console.log("Retrieved total wave count...", count.toNumber());
        this.setState(() => ({
          currentAccount: accounts[0],       // update the value of specific key
          totalwaves: count,
          controlIsLoading: false,
          leaderboard: this.state && this.state.leaderboard
        }
        ))
      } catch (error) {
        console.log(error)
      }
    }

    this.wave = async () => {
      try {
        const { ethereum } = window;


        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          this.setState(() => ({
            currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
            totalwaves: count.toNumber(),
            controlIsLoading: true,
            leaderboard: this.state && this.state.leaderboard
          }));
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave();
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          this.setState(() => ({
            currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
            totalwaves: count.toNumber(),

            controlIsLoading: false,
            leaderboard: this.state && this.state.leaderboard
          }));
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
        this.setState(() => ({
          currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
          totalwaves: this.state && this.state.totalwaves,

          controlIsLoading: false,
          leaderboard: this.state && this.state.leaderboard
        }));
      }
    }

    this.OpenWinModal = (e) => {

      let modalAddress = e.currentTarget.id;

      this.setState(() => ({
        currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
        totalwaves: this.state && this.state.totalwaves,

        controlIsLoading: false,
        leaderboard: this.state && this.state.leaderboard,
        modalAddress: modalAddress
      }));

    }


    this.CloseWinModal = (e) => {


      this.setState(() => ({
        currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
        totalwaves: this.state && this.state.totalwaves,

        controlIsLoading: false,
        leaderboard: this.state && this.state.leaderboard,
        modalAddress: undefined
      }));

    }


    this.submit = async () => {
      try {
        const { ethereum } = window;


        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          // let wavers = await wavePortalContract.getWavers();

          //   console.log("###############WAV ERS");

          //   wavers.map(async (myValue) => {

          //     let waveInfo = await wavePortalContract.getWaverInfo(myValue);
          //     await waveInfo.then(function (e) {
          //       console.log("###############e");
          //       console.log(e);
          //     });

          // });



          this.setState(() => ({
            currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
            totalwaves: this.state && this.state.totalwaves,

            controlIsLoading: true,
            leaderboard: this.state && this.state.leaderboard
          }));
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.submitImageUrl(this.state.puzzleImg.src);
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          this.setState(() => ({
            currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
            totalwaves: this.state && this.state.totalwaves,

            controlIsLoading: false,
            leaderboard: this.state && this.state.leaderboard
          }));
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
        this.setState(() => ({
          currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
          totalwaves: this.state && this.state.totalwaves,

          controlIsLoading: false,
          leaderboard: this.state && this.state.leaderboard
        }));
      }
    }

    this.checkIfWalletIsConnected();
    this.GetPuzzle();
  }


  render() {

    this.GetRandomBackground();
    return (
      <section id="showcase" className="d-flex flex-column align-items-center showcase">
        <div id="overlay"></div>
        <div id="header" className="container m-auto text-primary text-center intro-text py-2">




          {(this.state && this.state.isWinner) && (
            <Button
              id="event-cta"
              className={"hero-icon rocket-flight " + "pink"}
              onClick={this.submit}
            >

              <i className={"main fa fa-rocket"}></i>
            </Button>)}

          <CardColumns>
            <canvas id="canvas"></canvas>
            <div className="flexbox default puzzleintro">
              <div className="display-box m-5">
                I am Steve and did you know time is past?  You're welcome. Complete puzzles and join the leader board!

            </div>
            </div>
            <Card color="light" className="text-dark">
              <h2>Leader Board</h2>
              <ListGroup>
                {this.state && this.state.leaderboard && this.state.leaderboard.map((info) => (
                  <ListGroupItem key={info.address} className="justify-content-between">{info.address}<Badge className="text-warning m-2" pill>{info.wins} WINS</Badge><Button id={info.address} className="btn btn-large m-2" onClick={this.OpenWinModal}>View</Button></ListGroupItem>
                ))
                }

              </ListGroup>
            </Card>
          </CardColumns>
        </div>

        <Modal className="modal-lg " isOpen={this.state && this.state.modalAddress} toggle={this.CloseWinModal}>
          <ModalHeader
            toggle={this.CloseWinModal}>{this.state && this.state.modalAddress} Wins</ModalHeader>
          <ModalBody>
            {this.state && this.state.leaderboard && this.state.leaderboard.map((info) => {
              if (this.state && info.address === this.state.modalAddress) {
                return (
                  <ListGroupItem key={info.address} className="justify-content-between">

                    {info.imageUrls && info.imageUrls.map((src) => {

                      return (

                        <img src={src}></img>
                      );

                    })}

                  </ListGroupItem>
                );
              }
            })
            }
          </ModalBody>
        </Modal>

        <Modal className="modal-lg " isOpen={this.state && this.state.controlIsLoading}>
          <ModalHeader>Please Wait</ModalHeader>
          <ModalBody>
            <i class="fas fa-stroopwafel fa-spin"></i>
            <div>Please wait this may take a few moments...</div>
          </ModalBody>
        </Modal>

        <Modal className="modal-lg " isOpen={this.state && !this.state.currentAccount}>
          <ModalHeader>Please connect your wallet</ModalHeader>
          <ModalBody>
            {!this.state.currentAccount && (<button className="waveButton" onClick={this.connectWallet}>
              Connect Wallet
          </button>)}
          </ModalBody>
        </Modal>

      </section>
    );
  }
}

export default Showcase;
