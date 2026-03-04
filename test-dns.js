import dns from "dns";

dns.resolveSrv("_mongodb._tcp.cluster0.1eckpcc.mongodb.net", (err, addresses) => {
    if (err) console.error("DNS SRV failed:", err);
    else console.log("SRV addresses:", addresses);
});