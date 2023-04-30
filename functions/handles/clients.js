const { db } = require("../utils/admin");

//list Clients

const listClients = (req, res) => {
  const clientsDetailsRef = db.collection("clients");

  clientsDetailsRef
    .get()
    .then((querySnapshot) => {
      const responseData = [];
      querySnapshot.forEach((doc) => {
        const clientData = doc.data();
        clientData.uid = doc.id;
        responseData.push(clientData);
      });
      res.status(200).json(responseData);
    })
    .catch((error) => {
      if (error.res) {
        return res
          .status(error.res.data.error.code)
          .json({ error: error.res.data.error.message });
      } else {
        return res.status(500).json({ error: error.message });
      }
    });
};

// create client
const createClient = async (req, res) => {
  const newClient = {
    adresse: req.body.adresse,
    client: req.body.client,
    phoneNumber: req.body.phoneNumber,
    responsable: req.body.responsable,
    website: req.body.website,
    email: req.body.email,
  };

  // check if phone number already exists in the collection
  db.collection("clients")
    .where("phoneNumber", "==", newClient.phoneNumber)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // phone number already exists
        return res.status(400).json({
          error: `Le numéro de téléphone ${newClient.phoneNumber} est déjà utilisé par un autre client.`,
        });
      }
      // phone number does not exist, create new client document
      return db.collection("clients").add({
        adresse: newClient.adresse,
        client: newClient.client,
        phoneNumber: newClient.phoneNumber,
        responsable: newClient.responsable,
        website: newClient.website,
        email: newClient.email,
      });
    })
    .then((doc) => {
      return res.json({
        message: `Client ajouté avec succès. Veuillez rafraîchir la page pour voir les changements.`,
      });
    })
    .catch((error) => {
      if (error.response) {
        return res
          .status(error.response.status)
          .json({ error: error.response.data.error });
      } else {
        return res.status(500).json({ error: error.message });
      }
    });
};

// update Client

const updateClient = async (req, res) => {
  const updatedClient = {
    adresse: req.body.adresse,
    client: req.body.client,
    phoneNumber: req.body.phoneNumber,
    responsable: req.body.responsable,
    website: req.body.website,
    email: req.body.email,
  };

  db.collection("clients")
    .doc(req.params.uid) // specify the UID of the client to update
    .update(updatedClient) // update the client document
    .then(() => {
      return res.json({
        message:
          "Le client a été mis à jour avec succès. Veuillez rafraîchir la page pour voir les changements.",
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

// delete Client

const deleteClient = async (req, res) => {
  db.collection("clients")
    .doc(req.params.uid)
    .delete()
    .then(() => {
      return res.json({
        message: `Le client a été supprimé avec succés. Veuillez rafraîchir la page pour voir les changements.`,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

module.exports = {
  listClients,
  createClient,
  updateClient,
  deleteClient,
};
