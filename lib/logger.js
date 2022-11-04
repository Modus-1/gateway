/*
Console logger.
*/

const logInfo = (message)=>console.log(`[\u001b[34mINFO \u001b[0m${new Date().toLocaleTimeString()}]: ${message}`);
const logError = (message)=>console.log(`[\u001b[31mERROR \u001b[0m${new Date().toLocaleTimeString()}]: ${message}`);
const logWarning = (message)=>console.log(`[\u001b[33mWARN \u001b[0m${new Date().toLocaleTimeString()}]: ${message}`);

module.exports = {
    logInfo,
    logError,
    logWarning
}