const generatePassword = () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const getFileNameFromStorageUrl = (storageUrl) => {
  const fileName = storageUrl.split("/").pop();
  const queryIndex = fileName.indexOf("?");
  if (queryIndex !== -1) {
    return fileName.substr(0, queryIndex);
  }

  return fileName;
};

const mapShiftDataWithClientNames = (shiftsData, clientData) => {
  return shiftsData.map((user) => {
    const { clientId, ...rest } = user;
    const client = clientData.find((c) => c.id === clientId)?.client;
    return { clientId: client || clientId, ...rest };
  });
};

const mapShiftDataWithFunctionNames = (shiftsData, functionData) => {
  return shiftsData.map((shift) => {
    const matchingFunction = functionData.find(
      (func) => func.id === shift.requestedPosition
    );
    const functionName = matchingFunction
      ? matchingFunction.functionName
      : shift.requestedPosition;
    return { ...shift, requestedPosition: functionName };
  });
};

module.exports = {
  generatePassword,
  getFileNameFromStorageUrl,
  mapShiftDataWithClientNames,
  mapShiftDataWithFunctionNames,
};
