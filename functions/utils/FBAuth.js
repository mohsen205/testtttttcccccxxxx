const { db, axios, admin } = require("../utils/admin");

exports.FBAAuth = async (request, response, next) => {
  const idToken = request.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return response.status(401).json({ status: "UNAUTHORIZED_OPERATION" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedToken;
    const data = await db
      .collection("usersDetails")
      .where("uid", "==", request.user.uid)
      .limit(1)
      .get();
    if (!data.docs[0].data().role === "admin") {
      return response.status(401).json({ status: "UNAUTHORIZED_OPERATION" });
    }
    next();
  } catch (error) {
    return response.status(401).json(error);
  }
};

exports.FBUAuth = () => {};
