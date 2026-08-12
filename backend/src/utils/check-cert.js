import tls from "tls";

const socket = tls.connect({
    host: "192.168.1.68",
    port: 8220,
    rejectUnauthorized: false
}, () => {

    console.log("TLS connection established\n");

    const cert = socket.getPeerCertificate(true);

    console.log("========== SUBJECT ==========");
    console.log(cert.subject);

    console.log("\n========== ISSUER ==========");
    console.log(cert.issuer);

    console.log("\n========== VALID FROM ==========");
    console.log(cert.valid_from);

    console.log("\n========== VALID TO ==========");
    console.log(cert.valid_to);

    console.log("\n========== SAN ==========");
    console.log(cert.subjectaltname);

    console.log("\n========== SERIAL ==========");
    console.log(cert.serialNumber);

    console.log("\n========== FINGERPRINT ==========");
    console.log(cert.fingerprint256);

    socket.end();
});

socket.on("error", (error) => {
    console.error("TLS Error:", error);
});