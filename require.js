const require = (()=>{
    const loadedScripts = new Set();
    const loadingScripts = new Map();
    const load = (src, callback) => {
        if (loadedScripts.has(src)) {
            callback();
            return;
        }
        
        if (loadingScripts.has(src)) {
            loadingScripts.get(src).push(callback);
            return;
        }
  
        loadingScripts.set(src, [callback]);
        
        const script = (() => {
          let el;
          if((/\.css$/i).test(src)){
            el = document.createElement('link');
            el.rel = 'stylesheet';
            el.href = src;
          }else{
            el = document.createElement('script');
            el.type = 'text/javascript';
            if(src.startsWith('m:')){
              el.src = src.substr(2);
              el.type = 'module';
            }else{
              el.src = src;
            }
          }
          return el;
        })();
        
        script.onload = () => {
          setTimeout(()=>{
            loadedScripts.add(src);
            const callbacks = loadingScripts.get(src);
            for (const cb of callbacks) {
              cb();
            }
            loadingScripts.delete(src);  
          }, 50);
        };
        
        document.head.appendChild(script);
    };
  
    return (srcL) => Promise.all(
      (Array.isArray(srcL)?srcL:[srcL])
        .map(src => {
          if (typeof(src) == 'function'){
            const F = src;
            src = new Promise(r => {
              const tIter = () => {
                const v = F();
                if(v) return r(v)
                setTimeout(tIter, 300);
              }
              tIter();
            });
          }
          return (src instanceof Promise) ? src
            : new Promise(r => load(src, r))
        })
    );
  })();