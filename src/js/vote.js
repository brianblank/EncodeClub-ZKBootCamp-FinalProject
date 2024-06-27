import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { verifyProof } from "@semaphore-protocol/proof"

const NUM_IDENTITIES = 3; // This is the number of people who registered to vote

////////////////////////////////////////
// Create random identities
const identities = [];
for (let i = 0; i < NUM_IDENTITIES; i++) {
    // Identity() returns { privateKey, publicKey, commitment }
    identities.push(new Identity("secret-value" + i));  // This creates a deterministic identity
    // Note that this particular secret-value is not secure as it's too short.  This should be a very large number
}

// print all of the identifies to the console, including privateKey, publicKey, and commitment
console.log("Identities:");
identities.forEach((identity) => {
    console.log(identity);
    console.log("");
});
console.log("\n\n\n");

////////////////////////////////////////
// This group will contain all of the registered voters.
// The groups store the identity commitment which is just the hash of the public key
const registeredVoters = new Group(identities.map((identity) => identity.commitment));

// Generate Merkle Proofs for each of the registered voters
identities.forEach((identity, index) => {
    console.log("Proof for identity " + index + ":");
    console.log(registeredVoters.generateMerkleProof(index));
    console.log("");
});

// Create array of 2 strings "Donald Trump" and "Joe Biden"
const candidates = ["Donald Trump", "Joe Biden"];
const scope = "2024 Presidential Election";

const vote = [];
const proofs = [];
const proofIsValid = [];
for (let i = 0; i < NUM_IDENTITIES; i++) {
    // Each voter chooses a candidate.  For purposes of this example, we are randomly choosing a candidate
    vote.push(candidates[Math.floor(Math.random() * candidates.length)]);

    // THIS IS THE IMPORTANT PART
    // Here the voter signs their vote and generates a proof.  The proof proves:
    // 1. The voter is registered
    // 2. The voter voted for a specific candidate
    // 3. The voter only voted once (this is not implemented yet -- but we do generate the nullifier here which is used to prevent double voting)
    proofs.push(await generateProof(identities[i],  registeredVoters, vote[i], scope)); // THIS IS THE IMPORTANT PART

    // Verify the proof
    proofIsValid.push(await verifyProof(proofs[i]));
}

// print all of the proofs to the console
console.log("Vote Proofs:");
proofs.forEach((proof, index) => {
    console.log("Proof for identity " + index + ":");
    console.log("Vote: " + vote[index]);
    console.log(proof);
    console.log("Proof is valid: " + proofIsValid[index]);
    console.log("");
});
console.log("\n\n\n");

// Exit
process.exit(0);
