exports.getDate = function() { //folosim module.exports care este egal cu exports

const today = new Date();
    
    const options = {
        weekday: "long",
        day : "numeric",
        month: "long"
    };

  return today.toLocaleDateString("en-US", options); //pentru a mdofica felul in care scrie data
}