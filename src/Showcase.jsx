import React from 'react';
import { ethers } from "ethers";
import { Link } from 'react-router-dom';
import { Button, Card } from 'reactstrap'

import abi from './utils/WavePortal.json'

class Showcase extends React.Component {


  constructor(props) {
    super(props);


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
          this.setState(() => ({
            currentAccount: account,       // update the value of specific key
            totalwaves: this.state.totalwaves
          }
          ))
        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
        console.log(error);
      }
    }

    this.GetRandomBackground = () => {
      var app_id = 'TbXA1vdNhqrLnkvFhrntbGzVs3TwdxpK7ggZWduvFfs'
      var url = 'https://api.unsplash.com/photos/random?client_id=' + app_id;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(json) {
          var src = json.urls.regular;
          $('#showcase').css('background-image', 'url(' + src + ')').css('background-size', 'cover');
        }
      });
    }


    this.wave = async () => {
      try {
        const { ethereum } = window;

        /**
         * Create a variable here that holds the contract address after you deploy!
         */
        const contractAddress = "0x6312b65B67ff076400B5cC47851695Df0482247c";

        const contractABI = abi.abi;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          this.setState(() => ({
            currentAccount: this.state && this.state.currentAccount,       // update the value of specific key
            totalwaves: count.toNumber()
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
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
    }
  }



  render() {
    this.GetRandomBackground();
    return (
      <section id="showcase" className="d-flex flex-column align-items-center showcase">
        <div id="overlay"></div>
        <div id="header" className="container m-auto text-primary text-center intro-text py-2">
          <div className="flexbox default">
            <div className="display-box">
              <div className="bio">
                I am Steve and did you know time is past?  You're welcome. Connect your Ethereum wallet and buy me a coffee!
              </div>
            </div>
          </div>

          <Button
            id="event-cta"
            className={"hero-icon coffee-cup " + "tan"}
            onClick={this.wave}
          >

            <i className={"main fa fa-coffee"}></i>
            <div className="cup-steam">
              <i className="steam fa fa-fire"></i>
            </div>
            <i className="steam fa fa-fire"></i>
          </Button>

          <Card>
            {(this.state && this.state.totalwaves) ? this.state.totalwaves : 0}
          </Card>
        </div>
      </section>
    );
  }
}



export default Showcase;
