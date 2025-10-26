const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateFractal: (fractalKey, numPoints) => {
    console.log(`📤 Preload: sending generateFractal(${fractalKey}, ${numPoints})`);

    return ipcRenderer.invoke('generate-fractal', fractalKey, numPoints)
      .then(result => {
        console.log(`✅ Preload received the result successfully:`, result);

        if (result && result.error) {
          console.error(`⚠️  Preload: the result contains an error:`, result.error);
          throw new Error(result.error);
        }

        return result;
      })
      .catch(error => {
        console.error(`❌ Preload error during invocation:`, error);

        let errorMessage = 'Unknown error';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = error.error || error.message || JSON.stringify(error);
        }

        console.error(`   Transformed error message: ${errorMessage}`);

        return { 
          error: errorMessage 
        };
      });
  },

  onFractalData: (callback) => {
    ipcRenderer.on('fractal-data', (event, data) => {
      callback(data);
    });
  }
});

console.log('✅ Preload loaded — ready to work with main.js');
