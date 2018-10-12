
# 範例連結  
[https://guahsu.io/Vue-sessionStorage/dist/](https://guahsu.io/Vue-sessionStorage/dist/)  
  
# 多頁籤共享sessionStorage並同步至vuex

再vue專案中，如果有使用到vuex來做狀態管理，  
那很常會遇到一件事情就是重新整理後就遺失了原本的狀態，  
這裡紀錄我的解決方案：使多頁籤共享SessionStorage並透過同步達到Vuex資料的持久化。  

## 常見的登入判斷  
我們常在頁面判斷(vue-route: beforeEach)中寫下了像這樣的程式：
```javascript
router.beforeEach((to, from, next) => {
  const token = // 各種存放token的地方
  // 頁面跳轉前如果沒token就把帶到登入頁
  if (!token) {
    next({ path: '/login' })
  } else {
    next()
  }
})
```

## Token存哪？  
登入時取回的token我們有幾個地方可以選擇存放：  
1. Vuex  
優點：可以跟系統內其他vuex互相統一使用vuex的api來操作token，頁面關閉隨之銷毀  
缺點：當重新整理或開新分頁時就會被登出了(vuex被清除)  
  
2. Cookie  
優點：可由server端寫入，省掉前端寫入的工(?)  
缺點：可被user關閉、最高寫入4k，如果每次請求帶的話100張圖要get就會要多400k流量。  
  
3. LocalStorage  
優點：存放不會消失，不需要擔心頁面關閉或重整/新開分頁等問題  
缺點：因為永久存放(除非user手動清除)，必須加上時效性自行判斷，或特殊操作時要將其手動清除  
  
4. SessionStorage  
優點：頁籤開著的時候會一直存在著，即使是重新整理，頁籤關閉時會自動銷毀被儲存的資訊  
缺點：只在當前頁籤存在，開新分頁並不會被傳遞  
  
看起來不論選用哪個都會有優點或缺點，基於Vue專案Vuex是避不太了的基礎上，剩下只能擇一了。  
  
### Vuex + SessionStorage  
這裡我選用Vuex + sessionStorage做搭配，  
把重要的資訊(User資訊、Token..等)在sessionStorage中做一份備份，  
當頁面重整時再透過sessionStorage重新賦值給Vuex，  
來達到程式碼管理的統一性(各組件邏輯一樣都統一使用Vuex做操作)，  
也可以避免當頁面被關閉或重新開啟瀏覽器時要對LocalStorage資訊再做一次判斷與驗證的工。  
  
但缺點如上面所說，當User開新分頁時，新長出來的頁籤並不會有sessionStorage所儲存的資料，  
也就不會被同步到Vuex，為了解決這個問題我們得想辦法讓sessionStorage的資訊可以被分享傳遞到新的頁籤中。  
  
## sessionStorage多頁籤共享  
我在查找方案時看到這篇文章[Sharing sessionStorage between tabs for secure multi-tab authentication](https://blog.guya.net/2015/06/12/sharing-sessionstorage-between-tabs-for-secure-multi-tab-authentication/)  
網路上也有一些譯文，對我幫助非常多，我最終的解決方案也是基於這篇文章來做的。  
  
### 主要的作法簡述  
> 我有寫一個簡單的的登入範例，可以參考上方的連結  

1. 登入的邏輯取回token時，將token存於sessionStorage中  
```javascript
userLogin () {
  // ...登入邏輯
  xxxApi.userLogin().then(res => {
    window.sessionStorage.setItem('token', res.token)
    // ...跳轉至首頁
  })
}
```
  
2. 再Vue專案裡的index.html中加上這段，我替程式碼加上了註解  
```javascript
/* 註：此範例為複製全部sessionStorage內資料 */
(() => {
  // 判斷當前頁面是否存在sessionStorage
  if (!window.sessionStorage.length) {
    // 若不存在則加上一個localStorage Item, Key = getSessionStorageData
    window.localStorage.setItem('getSessionStorageData', Date.now())
  }
  // 增加window監聽事件'storage'
  window.addEventListener('storage', (event) => {
    // 如果偵聽到的事件是key是getSessionStorageData
    if (event.key === 'getSessionStorageData') {
      // 再新增一個localstorage Item, key = sessionStorageData，value就是當前的sessionStorage
      window.localStorage.setItem('sessionStorageData', JSON.stringify(window.sessionStorage))
      // 刪除localstorage中key = sessionStorageData的item
      window.localStorage.removeItem('sessionStorageData')
    }
    // 如果偵聽到的事件是key是sessionStorageData, 且當前的sessionStorage是空的
    if (event.key === 'sessionStorageData' && !window.sessionStorage.length) {
      // 把sessionStorageData的資料parse出來
      const data = JSON.parse(event.newValue)
      // 賦值到當前頁面的sessionStorage中
      for (let key in data) {
        window.sessionStorage.setItem(key, data[key])
      }
    }
  })
})()
```
  
### 整體流程簡述  
1. 判斷頁面是否存在sessionStorage，並加上store事件的偵聽  
2. 若不存在，就把原本的sessionStorage內的資料設定到localStorage中並取名為sessionStorageData  
3. 若storage事件偵聽到Key為sessionStorageData的事件，就把其內容透過for賦值到頁面sessionStorage中  
  
比較難懂的是這段  
```javascript
if (event.key === 'getSessionStorageData') {
  // 再新增一個localstorage Item, key = sessionStorageData，value就是當前的sessionStorage
  window.localStorage.setItem('sessionStorageData', JSON.stringify(window.sessionStorage))
  // 刪除localstorage中key = sessionStorageData的item
  window.localStorage.removeItem('sessionStorageData')
}
```
> 為什麼設定完後又直接刪除？  
  
注意，我們有為window添加偵聽事件`window.addEventListener('storage', ..)`  
這意味著每次storage事件被戳到的時候都會執行，所以當`setItem('sessionStorage')`的當下，也會接收到事件，  
代表著`window.localStorage.removeItem('sessionStorage')`其實是發生在sessionStorage被寫入之後的事情了，  
也因此才能達到同一個步驟做寫入與刪除，不留下過程中的localStorage資訊。  
  
> 或許你可能會跟我一樣好奇，新開的頁面為啥會有sessionStorage可以提供複製？  
  
查詢API([Using the Web Storage API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API))後才知道，各頁籤只要是同域名，  
有對storage動作時全部都會被連動，沒有詳閱過API真的還不知道storage事件可以做到同域名的狀態監測。  
  
### storage事件的測試  
關於這點可以簡單地做一個測試，隨便開兩個同網域的頁籤後，分別都開啟開發者工具：  
1. 在A頁籤中寫下  
`window.addEventListener('storage', (event) => console.log(event))`  
2. 在B頁籤寫下  
`window.localStorage.setItem(’storageTest’, ‘test’)`  
3. 再回頭看A頁籤，就會發現已經被偵聽到storage事件了！  
  
透過這樣的事件偵聽，就可以達到藉由localStorage來傳遞sessionStorage的目的。  
  
### sessionStorage與vuex的同步，修改登入判斷邏輯  
所以現在，修改router.beforeEach中的邏輯讓前往頁面的同時使sessionStorage的資料與vuex做同步。  
```javascript
router.beforeEach((to, from, next) => {
  // 一開始登入時寫進去的token
  const token = window.sessionStorage.getItem('token')
  if (to.matched.some(res => res.meta.requiresAuth)) {
    if (token) {
      // 同步到vuex中
      store.dispatch('root/setToken', token)
      next()
    } else {
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})
```
  
## 關於登出  
我們也可以同樣利用storage的特性，  
當登出時同步清除所有頁籤的sessionStorage並reload頁面：
```javascript
(() => {
  if (!window.sessionStorage.length) {
    window.localStorage.setItem('getSessionStorageData', Date.now())
  }
  window.addEventListener('storage', (event) => {
    if (event.key === 'getSessionStorageData') {
      window.localStorage.setItem('sessionStorageData', JSON.stringify(window.sessionStorage))
      window.localStorage.removeItem('sessionStorageData')
    }
    if (event.key === 'sessionStorageData' && !window.sessionStorage.length) {
      const data = JSON.parse(event.newValue)
      for (let key in data) {
        window.sessionStorage.setItem(key, data[key])
      }
    }
    // ========== 加下面這段 ==========
    if (event.key === 'logout') {
      // 接收到logout事件時，進行sessionStorage的清除與頁面reload
      window.sessionStorage.clear()
      window.location.reload()
    }
  })
})()
```
  
## 其他  
即便這樣看起來很OK了，但還是有些缺陷，如同原文作者有提到的：  
於Chrome, FireFox的恢復分頁功能會將sessionStorage的資料一併恢復，  
這可能會導致一些安全性的問題(不過相較於localStorage, 這應該不算問題?)  

另外要注意的就是，這個資料是在分頁被開啟的同時獲取的，  
意味著如果你的sessionStorage儲存著經常被異動的資料，必須得再多寫一些事件去做攔截與複製，  
因為storage事件不會偵聽到其他頁面的sessionStorage異動。  

以上為個人測試與實作的紀錄分享，如果有錯誤或更好的做法再請各位大大指教了:) !

### 參考資料  
1. [Sharing sessionStorage between tabs for secure multi-tab authentication](https://blog.guya.net/2015/06/12/sharing-sessionstorage-between-tabs-for-secure-multi-tab-authentication/)  
2. [Using the Web Storage API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)  