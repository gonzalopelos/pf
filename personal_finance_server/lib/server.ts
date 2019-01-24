var expressApp = require('./fpApp'); 
const PORT = 3001;

expressApp.default.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})