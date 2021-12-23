import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import metadataFile from "./contracts/TestNFT.json";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

import "./App.css";

const client = create("https://ipfs.infura.io:5001/api/v0");

const contractInfo = {
  abi: metadataFile,
  address: "0xEE664753BEFD23Ab6319Ca56C1180f3F29a6877a",
};

const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(
  contractInfo.address,
  contractInfo.abi,
  provider
);

function App() {
  provider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      window.location.reload();
    }
  });
  const [currentAccount, setCurrentAccount] = useState(null);

  const [cid, setCid] = useState("");
  const [json, setJson] = useState("");

  const switchNetworkMumbai = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "Mumbai",
                rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
                nativeCurrency: {
                  name: "Matic",
                  symbol: "Matic",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
              },
            ],
          });
        } catch (error) {
          alert(error.message);
        }
      }
    }
  };

  const connectWalletHandler = async () => {
    await switchNetworkMumbai();
    await switchNetworkMumbai();
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {}
  };

  const mint = async (json) => {
    const added = await client.add(json);

    const signerContract = contract.connect(provider.getSigner());

    await signerContract.mint_single(currentAccount, added.path);
  };

  useEffect(() => {
    let obj = {
      name: `NFT name`,
      description: `NFT Description`,
      animation_url: `https://ipfs.io/ipfs/${cid}`,
      background_color: `000000`,
    };

    setJson(JSON.stringify(obj));
  }, [cid]);

  const connectWalletButton = () => {
    return (
      <Button onClick={connectWalletHandler} className="connect-wallet-button">
        Connect Wallet
      </Button>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <Row>
            <h4>
              Contract address&nbsp;
              {contract.address}
            </h4>
          </Row>
        </Container>
      </header>
      <div className="mb-3">
        {currentAccount ? (
          <div className="mt-3 mb-3">
            <h4></h4>
          </div>
        ) : (
          connectWalletButton()
        )}
      </div>
      <p>1. Get some test MATIC from https://faucet.polygon.technology/ </p>
      <p>
        2. Upload your glb file to IPFS using
        https://app.pinata.cloud/pinmanager
      </p>
      <p>3. Copy the CID in here </p>
      <p>4. Change the JSON properties as you wish </p>
      <p>5. Mint </p>
      <p>6. Check your NFT on https://testnets.opensea.io/</p>
      <div className="mt-5" />
      <Container fluid className="Container">
        <Row className="justify-content-md-center">
          <Col className="col-md-auto">
            <Card style={{ width: "50rem" }} className="Card m-3">
              <Card.Body>
                <Card.Title>Your NFT</Card.Title>

                {currentAccount ? (
                  <div>
                    <Form>
                      <Form.Group
                        className="mb-3"
                        controlId="formCID"
                        onChange={(e) => setCid(e.target.value)}
                      >
                        <Form.Label>Enter your CID here</Form.Label>
                        <Form.Control placeholder="CID" />
                      </Form.Group>
                      <Form.Text className="text-muted">
                        The following JSON will be uploaded to IPFS and minted
                        as NFT. You can edit it!
                      </Form.Text>

                      <Form.Group className="mb-3" controlId="formJSON">
                        <Form.Control
                          as="textarea"
                          rows={10}
                          value={json}
                          onChange={(e) => setJson(e.target.value)}
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        onClick={async () => {
                          await mint(json);
                        }}
                      >
                        Mint
                      </Button>
                    </Form>
                  </div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
