var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");

var fs = require("fs");
var path = require("path");

var network_folder_name = "test-network";


var org_name = "org1";
var demo_fabric_network_name = "example";
var peer_host = 'localhost';
var peer_port = 7051;
var channel_name = "mychannel";

var demo_fabric_network_path = path.resolve("..",network_folder_name);
var org_domain_name = `${org_name}.${demo_fabric_network_name}.com`;

var org_tlsca_cert_path = path.resolve(
  demo_fabric_network_path,
  "organizations",
  "peerOrganizations",
  org_domain_name,
  "tlsca",
  `tlsca.${org_domain_name}-cert.pem`
);
var org_tlsca_cert = fs.readFileSync(org_tlsca_cert_path, "utf8");

var fabric_client = new Fabric_Client();

  
var store_path = path.join(__dirname, `../hfc-key-store/${org_name}`);
console.log(" Store path:" + store_path);

// setup the fabric network
var channel = fabric_client.newChannel(channel_name);

var peer = fabric_client.newPeer(`grpcs://${peer_host}:${peer_port}`, {
	'ssl-target-name-override': `peer0.${org_name}.${demo_fabric_network_name}.com`,
	pem: org_tlsca_cert
});
channel.addPeer(peer);


module.exports = {
	common_query: function(chain_code_name,user_name,func_name,args) {
		return new Promise(resolve => {
			Fabric_Client.newDefaultKeyValueStore({ path: store_path })
			.then(state_store => {
				fabric_client.setStateStore(state_store);
				var crypto_suite = Fabric_Client.newCryptoSuite();
				var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
				crypto_suite.setCryptoKeyStore(crypto_store);
				fabric_client.setCryptoSuite(crypto_suite);
		
				return fabric_client.getUserContext(user_name, true);
		  })
		  .then(user_from_store => {
			if (user_from_store && user_from_store.isEnrolled()) {
			  console.log(`Successfully loaded ${user_name} from persistence`);
			} else {
			  throw new Error(`Failed to get User ${user_name} register User using registrations program`);
			}
	  
			const request = {
			  chaincodeId: chain_code_name,
			  fcn: func_name,
			  args: args
			};
	  
			return channel.queryByChaincode(request);
		  })
		  .then(query_responses => {
			console.log("Query has completed, checking results");
			if (query_responses && query_responses.length == 1) {
			  if (query_responses[0] instanceof Error) {
				console.error("error from query = ", query_responses[0]);
			  } else {
				  console.log(func_name);
				if (func_name == "queryAllTransactions"){
					console.log(query_responses[0])
					let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
					let data_in_string = query_responses[0].toString();
					let data = data_in_string.replace(regex,"");
					data = JSON.parse(data)
					resolve({"code":1,"response":data})
				}
				else{
					let data = JSON.parse(query_responses[0]);
					// data = JSON.parse(data)
					resolve({"code":1,"response":data})
				}
				
			  }
			} else {
			  console.log("No payloads were returned from query");
			}
		  })
		  .catch(err => {
			console.error("Failed to query successfully :: " + err);
		  });
				
			});
			
	  }
	  
}

