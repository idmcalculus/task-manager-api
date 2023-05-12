require('dotenv').config();
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const swaggerDocument = require('./swagger');
const connectToDatabase = require('./database/connection');
const { handleError } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
});

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan('dev'));

// Apply rate limiter to all API routes
app.use('/v1/', apiRateLimiter);

// Routes
app.use('/v1/users', userRoutes);
app.use('/v1/tasks', taskRoutes);

// error handler middleware
app.use(handleError);

// Connect to the MongoDB database
connectToDatabase()
.then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      	console.log(`Server is running on port ${port}`);
    });
})
.catch((err) => {
	console.error('Failed to connect to MongoDB', err);
});

module.exports = app;
