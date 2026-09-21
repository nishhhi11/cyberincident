const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const token = authHeader.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;