require('./src').purge().then(r => require('./src').indexer()).then(r => console.log(r))
    //require('./src').indexer().then(r => console.log('Ready'))