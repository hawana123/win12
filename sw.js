const sw_version = '20260828b';
let dymanic = [
  'assets.msn.cn'
]
this.addEventListener('fetch', function (event) {
  if (!/^https?:$/.test(new URL(event.request.url).protocol)) return

  event.respondWith(
    caches.match(event.request).then(res => {
      let fl = false;
      dymanic.forEach(d => {
        if (event.request.url.indexOf(d) > 0) {
          fl = true;
          return;
        }
      });
      if (fl) {
        console.log('动态请求', event.request.url);
        return fetch(event.request);
      }
      // HTML 和 JS 文件使用网络优先策略，确保代码更新即时生效
      if (event.request.method === 'GET' && event.request.url.match(/\.(html?|js)(\?|$)/)) {
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open('def').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          return res || fetch(event.request).catch(err => {
            console.log(err);
          });
        });
      }
      // 其他资源使用缓存优先策略
      return res ||
        fetch(event.request)
          .then(responese => {
            if (event.request.method === 'GET' && responese.status === 200) {
              const responeseClone = responese.clone();
              caches.open('def').then(cache => {
                console.log('下载数据', responeseClone.url);
                cache.put(event.request, responeseClone);
              })
            }
            return responese;
          })
          .catch(err => {
            console.log(err);
          });
    })
  )
});
const cacheNames = ['def'];
let nochanges = [
  '/win12/fonts/',
  '/win12/img/',
  '/win12/apps/icons/',
  '/win12/jq.min.js',
  '/win12/bootstrap-icons.css',
]
let flag = false;

function update(force = false) {
  caches.keys().then(keys => {
    if (keys.includes('def')) {
      caches.open('def').then(cc => {
        cc.keys().then(key => {
          key.forEach(k => {
            let fl = true;
            if (force) {
              console.log('删除数据', k.url);
              return cc.delete(k);
            }
            nochanges.forEach(fi => {
              if (RegExp(fi + '\\S+').test(k.url)) {
                fl = false;
                return;
              }
            });
            if (fl) {
              console.log('删除数据', k.url);
              return cc.delete(k);
            }
          });
        });
      });
    }
  });
}


this.addEventListener('message', function (e) {
  if (e.data.head == 'update') {
    if(e.data.force)update(true);
    else update();
  }
  if (e.data.head == 'check_version') {
    if (e.data.version !== sw_version) {
      console.log('SW版本不匹配，强制更新缓存');
      update(true);
    }
  }
});
this.addEventListener('activate', update);

// let dongtai=[
//   'api.github.com',
//   'tjy-gitnub.github.io/win12-theme',
//   'win12server.freehk.svipss.top',
//   'assets.msn.cn'
// ]
// this.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request).then(res => {
//       let fl=false;
//       dongtai.forEach(d=>{
//         if(event.request.url.indexOf(d)>0){
//           fl=true;
//           return;
//         }
//       });
//       if(fl){console.log('动态请求',event.request.url);return fetch(event.request);}
//       return res ||
//         fetch(event.request)
//           .then(responese => {
//             // console.log(event.request);
//             const responeseClone = responese.clone();
//             caches.open('def').then(cache => {
//               console.log('下载数据', responeseClone.url);
//               cache.put(event.request, responeseClone);
//             })
//             return responese;
//           })
//           .catch(err => {
//             console.log(err);
//           });
//     })
//   )
// });
// const cacheNames = ['def'];
// let nochanges = [
//   '/win12/fonts/',
//   '/win12/img/',
//   '/win12/apps/icons/',
//   '/win12/jq.min.js',
//   '/win12/bootstrap-icons.css',
// ]
// let flag = false;
// this.addEventListener('activate', function (event) {
//   flag = true;
//   console.log('开始更新');
//   event.waitUntil(
//     caches.keys().then(keys => {
//       if (keys.includes('def')) {
//         caches.open('def').then(cc => {
//           cc.keys().then(key => {
//             key.forEach(k => {
//               let fl = true;
//               nochanges.forEach(fi => {
//                 if (RegExp(fi + '\\S+').test(k.url)) {
//                   fl = false;
//                   return;
//                 }
//               });
//               if (fl) {
//                 console.log('删除数据', k.url);
//                 return cc.delete(k);
//               }
//             });
//           })
//         })
//       }
//     })
//   );
//   event.waitUntil(
//     caches.open('def').then(function (cache) {
//       return cache.addAll([
//         'bg-dark.svg'
//       ]);
//     })
//   );
// });
// this.addEventListener('message', function (e) {
//   if (e.data.head == 'is_update') {
//     if (flag) {
//       e.source.postMessage({
//         head: 'update'
//       });
//       flag = false;
//     }
//   }
// });
