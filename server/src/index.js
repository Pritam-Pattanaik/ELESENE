const app = require('./app');
const { sequelize } = require('./models');
require('./config/env');

const PORT = process.env.PORT || 3000;

sequelize.authenticate().then(() => {
  console.log('Database connected successfully');
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

module.exports = app;

