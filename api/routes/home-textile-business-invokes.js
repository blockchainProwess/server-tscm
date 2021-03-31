var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");


var fabric_client = new Fabric_Client();

var fs = require("fs");
var path = require("path");
const util = require('util');


var network_folder_name = "test-network";
var channel_name = "mychannel";

var demo_fabric_network_path = path.resolve("..",network_folder_name);

var org1_name = "org1";
var org2_name = "org2";
var org3_name = "org3";
var org4_name = "org4";
var org5_name = "org5";


var demo_fabric_network_name = "example";
var peer_host = 'localhost';
var org1_peer_port = 7051;
var org2_peer_port = 9051;
var org3_peer_port = 6051;
var org4_peer_port = 5051;
var org5_peer_port = 4051;



var org1_domain_name = `${org1_name}.${demo_fabric_network_name}.com`;
var org2_domain_name = `${org2_name}.${demo_fabric_network_name}.com`;
var org3_domain_name = `${org3_name}.${demo_fabric_network_name}.com`;
var org4_domain_name = `${org4_name}.${demo_fabric_network_name}.com`;
var org5_domain_name = `${org5_name}.${demo_fabric_network_name}.com`;

var chain_name = "mychannel";

var store_path = path.join(__dirname, `../hfc-key-store/org1`);
console.log(" Store path:" + store_path);

// setup the fabric network
var channel = fabric_client.newChannel(channel_name);

var org1_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org1_domain_name,
  "tlsca",
  `tlsca.${org1_domain_name}-cert.pem`
);
var org1_tlsca_cert = fs.readFileSync(org1_tlsca_cert_path, "utf8");
  
var org1_peer = fabric_client.newPeer(`grpcs://${peer_host}:${org1_peer_port}`, {
	'ssl-target-name-override': `peer0.${org1_name}.${demo_fabric_network_name}.com`,
	pem: org1_tlsca_cert
});

channel.addPeer(org1_peer);

var org2_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org2_domain_name,
  "tlsca",
  `tlsca.${org2_domain_name}-cert.pem`
);
var org2_tlsca_cert = fs.readFileSync(org2_tlsca_cert_path, "utf8");
  
var org2_peer = fabric_client.newPeer(`grpcs://${peer_host}:${org2_peer_port}`, {
	'ssl-target-name-override': `peer0.${org2_name}.${demo_fabric_network_name}.com`,
	pem: org2_tlsca_cert
});

channel.addPeer(org2_peer);

var org3_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org3_domain_name,
  "tlsca",
  `tlsca.${org3_domain_name}-cert.pem`
);
var org3_tlsca_cert = fs.readFileSync(org3_tlsca_cert_path, "utf8");
  
var org3_peer = fabric_client.newPeer(`grpcs://${peer_host}:${org3_peer_port}`, {
	'ssl-target-name-override': `peer0.${org3_name}.${demo_fabric_network_name}.com`,
	pem: org3_tlsca_cert
});

channel.addPeer(org3_peer);

var org4_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org4_domain_name,
  "tlsca",
  `tlsca.${org4_domain_name}-cert.pem`
);
var org4_tlsca_cert = fs.readFileSync(org4_tlsca_cert_path, "utf8");
  
var org4_peer = fabric_client.newPeer(`grpcs://${peer_host}:${org4_peer_port}`, {
	'ssl-target-name-override': `peer0.${org4_name}.${demo_fabric_network_name}.com`,
	pem: org4_tlsca_cert
});

channel.addPeer(org4_peer);

var org5_tlsca_cert_path = path.resolve(
    demo_fabric_network_path,
    "organizations",
    "peerOrganizations",
    org5_domain_name,
    "tlsca",
    `tlsca.${org5_domain_name}-cert.pem`
  );
  var org5_tlsca_cert = fs.readFileSync(org5_tlsca_cert_path, "utf8");
    
  var org5_peer = fabric_client.newPeer(`grpcs://${peer_host}:${org5_peer_port}`, {
      'ssl-target-name-override': `peer0.${org5_name}.${demo_fabric_network_name}.com`,
      pem: org5_tlsca_cert
  });
  
  channel.addPeer(org5_peer);
  



module.exports = {
	common_invoke: function(chain_code_name,user_name,function_name,args) {
		return new Promise(resolve => {
                console.log(args);
                var value = invoke(chain_code_name,user_name,function_name,args).then(res=>{
                  console.log(res);
                  resolve(res);
                });
      console.log(value);
			});
			
	  }
	  
}

async function invoke(chain_code_name,user_name,function_name,args) {
  try {      
      
      // ----- CRYPTO SUITE PREPARATION ---------- //
      const state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path});
      console.log(state_store);
      // assign the store to the fabric client
      fabric_client.setStateStore(state_store);
      const crypto_suite = Fabric_Client.newCryptoSuite();
      
      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
      const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
      crypto_suite.setCryptoKeyStore(crypto_store);
      fabric_client.setCryptoSuite(crypto_suite);
      // ----- ************* ---------- //

      // ---------- USER EXISTENSE CHECK ------------- //
      // get the enrolled user from persistence and assign to the client instance
      //    this user will sign all requests for the fabric network
      const user = await fabric_client.getUserContext(user_name, true);
      if (user && user.isEnrolled()) {
        console.log(`Successfully loaded ${user_name} from user store`);
      } else {
        throw new Error(`\n\nFailed to get user ${user_name} run registerUser.js`);
      }
  
      console.log('Successfully setup client side');
      console.log('\n\nStart invoke processing');
      // ---------- *********** ------------- //

      // Use service discovery to initialize the channel
      await channel.initialize({ discover: true, asLocalhost: true, target: org1_peer });
      console.log('Used service discovery to initialize the channel');
  
      const tx_id = fabric_client.newTransactionID();
      console.log(util.format("\nCreated a transaction ID: %s", tx_id.getTransactionID()));
  
      const proposal_request = {
        targets: [org1_peer,org2_peer,org3_peer,org4_peer,org5_peer],
        chaincodeId: chain_code_name,
        fcn: function_name,
        args:args,
        chainId: chain_name,
        txId: tx_id
      };
  
      // ------- SENDING TRANSACTION PROPOSAL TO PEERS -------------- //
      const endorsement_results = await channel.sendTransactionProposal(proposal_request);
      
      const proposalResponses = endorsement_results[0];
      const proposal = endorsement_results[1];
  
      console.log(proposalResponses,proposal);



      // check the results to decide if we should send the endorsment to be orderered
      if (proposalResponses[0] instanceof Error) {
        console.error('Failed to send Proposal. Received an error :: ' + proposalResponses[0].toString());
        throw proposalResponses[0];
      } else if (proposalResponses[0].response && proposalResponses[0].response.status === 200) {
        console.log(util.format(
          'Successfully sent Proposal and received response: Status - %s',
          proposalResponses[0].response.status));
      } else {
        const error_message = util.format('Invoke chaincode proposal:: %j', proposalResponses[i]);
        console.error(error_message);
        throw new Error(error_message);
      }
  
      // The proposal was good, now send to the orderer to have the transaction
      // committed.
  
      const commit_request = {
        proposalResponses: proposalResponses,
        proposal: proposal
      };
  
      //Get the transaction ID string to be used by the event processing
      const transaction_id_string = tx_id.getTransactionID();
  
      // create an array to hold on the asynchronous calls to be executed at the
      // same time
      const promises = [];
  
      // this will send the proposal to the orderer during the execuction of
      // the promise 'all' call.
      const sendPromise = channel.sendTransaction(commit_request);
      //we want the send transaction first, so that we know where to check status
      promises.push(sendPromise);
  
      // get an event hub that is associated with our peer
      let event_hub = channel.newChannelEventHub(org1_peer);
  
      // create the asynchronous work item
      let txPromise = new Promise((resolve, reject) => {
        let handle = setTimeout(() => {
          event_hub.unregisterTxEvent(transaction_id_string);
          event_hub.disconnect();
          resolve({event_status : 'TIMEOUT'});
        }, 30000);
  
        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
          // this first callback is for transaction event status
  
          // callback has been called, so we can stop the timer defined above
          clearTimeout(handle);
  
          // now let the application know what happened
          const return_status = {event_status : code, tx_id : transaction_id_string};
          if (code !== 'VALID') {
            console.error('The transaction was invalid, code = ' + code);
            resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
          } else {
            console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
            resolve(return_status);
          }
        }, (err) => {
          //this is the callback if something goes wrong with the event registration or processing
          reject(new Error('There was a problem with the eventhub ::'+err));
        },
          {disconnect: true} //disconnect when complete
        );
  
        // now that we have a protective timer running and the listener registered,
        // have the event hub instance connect with the peer's event service
        event_hub.connect();
        console.log('Registered transaction listener with the peer event service for transaction ID:'+ transaction_id_string);
      });
  
      // set the event work with the orderer work so they may be run at the same time
      promises.push(txPromise);
  
      // now execute both pieces of work and wait for both to complete
      console.log('Sending endorsed transaction to the orderer');
      const results = await Promise.all(promises);
  
      if (results[0].status === 'SUCCESS') {
        console.log('Successfully sent transaction to the orderer');
      } else {
        const message = util.format('Failed to order the transaction. Error code: %s', results[0].status);
        console.error(message);
        throw new Error(message);
      }
  
      if (results[1] instanceof Error) {
        // console.error(message);
        throw new Error(message);
      } else if (results[1].event_status === 'VALID') {
        // console.log('Successfully committed the change to the ledger by the peer');
        // console.log('\n\n - try running "node query.js" to see the results');
        return({"code":1});
        // console.log(results[1].event_status);
      } else {
        console.log(results[1]);
        
        const message = util.format('Transaction failed to be committed to the ledger due to : %s', results[1].event_status)
        console.error(message);
        throw new Error(message);
      }
    } catch(error) {
      console.log('Unable to invoke ::'+ error.toString());
      return({"code":-1,"err":error.toString()})
    }
    // console.log('\n\n --- invoke.js - end');
    // return({"code":1})
    
  };





