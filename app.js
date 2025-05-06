(() => {
  // Initialize Facebook SDK
  window.fbAsyncInit = function() {
    FB.init({
      appId      : 'YOUR_FACEBOOK_APP_ID', // REPLACE THIS with your Facebook App ID
      cookie     : true,
      xfbml      : false,
      version    : 'v17.0'
    });
  };

  const loginContainer = document.getElementById('login-container');
  const pages = {
    balance: document.getElementById('page-balance'),
    earn: document.getElementById('page-earn'),
    withdraw: document.getElementById('page-withdraw'),
  };

  const navButtons = {
    balance: document.querySelector('nav#burger-menu button[data-page="balance"]'),
    earn: document.querySelector('nav#burger-menu button[data-page="earn"]'),
    withdraw: document.querySelector('nav#burger-menu button[data-page="withdraw"]'),
    logout: document.getElementById('nav-logout'),
  };

  const burgerBtn = document.getElementById('burger-menu-btn');
  const burgerMenu = document.getElementById('burger-menu');
  const logoutBtn = document.getElementById('logout-btn');

  // Login/Register elements
  const loginPage = document.getElementById('login-page');
  const registerPage = document.getElementById('register-page');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const fbLoginBtn = document.getElementById('fb-login-btn');
  const emailLoginBtn = document.getElementById('email-login-btn');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const registerBtn = document.getElementById('register-btn');
  const regEmailInput = document.getElementById('reg-email-input');
  const regPasswordInput = document.getElementById('reg-password-input');

  // Balance and referral elements
  const balanceAmountEl = document.getElementById('balance-amount');
  const referralLinkInput = document.getElementById('referral-link');
  const copyReferralBtn = document.getElementById('copy-referral-btn');
  const userLevelEl = document.getElementById('user-level');
  const inviteCountEl = document.getElementById('invite-count');

  // Earn buttons and invite
  const followFacebookBtn = document.getElementById('follow-facebook-btn');
  const followTwitterBtn = document.getElementById('follow-twitter-btn');
  const followYoutubeBtn = document.getElementById('follow-youtube-btn');
  const twitterLikeBtn = document.getElementById('twitter-like-btn');
  const inviteBtn = document.getElementById('invite-btn');

  // Withdraw form elements
  const withdrawForm = document.getElementById('withdraw-form');
  const withdrawAmountInput = document.getElementById('withdraw-amount');
  const withdrawMethodSelect = document.getElementById('withdraw-method');
  const accountDetailsInput = document.getElementById('account-details');

  const storageKey = 'earnify_users';
  const loginStorageKey = 'earnify_logged_in';
  let currentUser = null;

  // Utility functions
  function getUsers() {
    const str = localStorage.getItem(storageKey);
    return str ? JSON.parse(str) : {};
  }

  function saveUsers(users) {
    localStorage.setItem(storageKey, JSON.stringify(users));
  }

  function saveCurrentUser(user) {
    localStorage.setItem(loginStorageKey, user.email);
  }

  function getCurrentUser() {
    const email = localStorage.getItem(loginStorageKey);
    if (!email) return null;
    const users = getUsers();
    return users[email] || null;
  }

  function updateUser(user) {
    const users = getUsers();
    users[user.email] = user;
    saveUsers(users);
  }

  function logout() {
    localStorage.removeItem(loginStorageKey);
    currentUser = null;
  }

  function clearInputs() {
    emailInput.value = '';
    passwordInput.value = '';
    regEmailInput.value = '';
    regPasswordInput.value = '';
  }

  // Page display functions
  function showLogin() {
    loginContainer.style.display = 'block';
    Object.values(pages).forEach(p => (p.hidden = true));
    burgerMenu.style.display = 'none';
    logoutBtn.style.display = 'none';
    burgerBtn.style.display = 'none';
    clearInputs();
    loginPage.hidden = false;
    registerPage.hidden = true;
  }

  function showRegister() {
    loginContainer.style.display = 'block';
    Object.values(pages).forEach(p => (p.hidden = true));
    burgerMenu.style.display = 'none';
    logoutBtn.style.display = 'none';
    burgerBtn.style.display = 'none';
    clearInputs();
    loginPage.hidden = true;
    registerPage.hidden = false;
  }

  function showPage(pageName) {
    loginContainer.style.display = 'none';
    Object.keys(pages).forEach(key => {
      pages[key].hidden = key !== pageName;
    });
    burgerMenu.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    burgerBtn.style.display = 'inline-flex';
    setActiveNav(pageName);
  }

  function setActiveNav(activePage) {
    Object.keys(navButtons).forEach(key => {
      const isActive = key === activePage;
      navButtons[key].classList.toggle('active', isActive);
      navButtons[key].setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function generateReferralLink(email) {
    const url = new URL(window.location.origin);
    url.searchParams.set('ref', email);
    return url.toString();
  }

  function refreshUserUI() {
    if (!currentUser) return;
    balanceAmountEl.textContent = currentUser.balance.toLocaleString();
    userLevelEl.textContent = currentUser.level || 1;
    inviteCountEl.textContent = currentUser.invites || 0;
    referralLinkInput.value = generateReferralLink(currentUser.email);

    followFacebookBtn.disabled = currentUser.followedFacebook || false;
    followTwitterBtn.disabled = currentUser.followedTwitter || false;
    followYoutubeBtn.disabled = currentUser.followedYoutube || false;
    twitterLikeBtn.disabled = currentUser.likedRetweetedTwitter || false;
  }

  // Daily Login Bonus
  function tryClaimDailyLoginBonus() {
    if (!currentUser) return;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (!currentUser.lastLoginBonus || now - currentUser.lastLoginBonus > dayMs) {
      currentUser.balance += 1000;
      currentUser.lastLoginBonus = now;
      updateUser(currentUser);
      refreshUserUI();
      alert('🎉 Daily login bonus of ₦1000 credited!');
    }
  }

  // Event Handlers

  fbLoginBtn.addEventListener('click', () => {
    FB.login(
      function (response) {
        if (response.authResponse) {
          FB.api('/me', { fields: 'email' }, function (userInfo) {
            let email = userInfo.email || `${userInfo.id}@fb.fake`;
            let users = getUsers();
            if (!users[email]) {
              users[email] = {
                email,
                password: '',
                balance: 1000,
                invites: 0,
                level: 1,
                lastLoginBonus: 0,
                followedFacebook: false,
                followedTwitter: false,
                followedYoutube: false,
                likedRetweetedTwitter: false,
                videoWatched: {}
              };
              saveUsers(users);
            }
            currentUser = users[email];
            saveCurrentUser(currentUser);
            showPage('balance');
            refreshUserUI();
            tryClaimDailyLoginBonus();
          });
        } else {
          alert('Facebook login was cancelled or failed.');
        }
      },
      { scope: 'email,public_profile' }
    );
  });

  emailLoginBtn.addEventListener('click', () => {
    let email = emailInput.value.trim().toLowerCase();
    let password = passwordInput.value;
    let users = getUsers();

    if (!users[email]) return alert('User not found. Please register.');
    if (users[email].password !== password) return alert('Incorrect password.');

    currentUser = users[email];
    saveCurrentUser(currentUser);
    showPage('balance');
    refreshUserUI();
    tryClaimDailyLoginBonus();
  });

  registerBtn.addEventListener('click', () => {
    let email = regEmailInput.value.trim().toLowerCase();
    let password = regPasswordInput.value;
    if (!email || !password) return alert('Please enter both email and password.');

    let users = getUsers();
    if (users[email]) return alert('User already exists. Please login.');

    users[email] = {
      email,
      password,
      balance: 1000,
      invites: 0,
      level: 1,
      lastLoginBonus: 0,
      followedFacebook: false,
      followedTwitter: false,
      followedYoutube: false,
      likedRetweetedTwitter: false,
      videoWatched: {}
    };
    saveUsers(users);
    alert('Registration successful! Please login.');
    showLogin();
  });

  showRegisterLink.addEventListener('click', showRegister);
  showLoginLink.addEventListener('click', showLogin);

  logoutBtn.addEventListener('click', () => {
    logout();
    showLogin();
  });

  navButtons.logout.addEventListener('click', () => {
    logout();
    showLogin();
    burgerMenu.hidden = true;
    burgerBtn.setAttribute('aria-expanded', 'false');
  });

  burgerBtn.addEventListener('click', () => {
    const expanded = burgerBtn.getAttribute('aria-expanded') === 'true';
    burgerBtn.setAttribute('aria-expanded', !expanded);
    burgerMenu.hidden = expanded;
  });

  Object.keys(navButtons).forEach(key => {
    if (key !== 'logout') {
      navButtons[key].addEventListener('click', () => {
        showPage(key);
        burgerMenu.hidden = true;
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  copyReferralBtn.addEventListener('click', () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(referralLinkInput.value)
        .then(() => alert('Referral link copied!'))
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999);
    if (document.execCommand('copy')) {
      alert('Referral link copied!');
    } else {
      alert('Failed to copy referral link.');
    }
  }

  function followEarn(platform, url, key, amount, btn) {
    if (currentUser[key]) {
      alert(`You have already earned ₦${amount.toLocaleString()} for following ${platform}.`);
      return;
    }
    window.open(url, '_blank', 'noopener');
    if (confirm(`Did you follow our ${platform} page? Click OK to confirm and earn ₦${amount.toLocaleString()}.`)) {
      currentUser.balance += amount;
      currentUser[key] = true;
      updateUser(currentUser);
      refreshUserUI();
      alert('🎉 Earned ₦' + amount.toLocaleString());
      btn.disabled = true;
    }
  }
  followFacebookBtn.addEventListener('click', () =>
    followEarn('Facebook', 'https://www.facebook.com/share/1CQTgX1XFw/?mibextid=qi2Omg', 'followedFacebook', 5000, followFacebookBtn)
  );
  followTwitterBtn.addEventListener('click', () =>
    followEarn('Twitter', 'https://twitter.com/youraccount', 'followedTwitter', 5000, followTwitterBtn)
  );
  followYoutubeBtn.addEventListener('click', () =>
    followEarn('YouTube', 'https://youtube.com/@learnwithugo', 'followedYoutube', 5000, followYoutubeBtn)
  );

  twitterLikeBtn.addEventListener('click', () => {
    if (currentUser.likedRetweetedTwitter) {
      alert('Already earned for liking & retweeting.');
      return;
    }
    window.open('https://twitter.com/youraccount/status/1234567890', '_blank', 'noopener');
    if (confirm('Did you like and retweet our Twitter post? Click OK to confirm and earn ₦500.')) {
      currentUser.balance += 500;
      currentUser.likedRetweetedTwitter = true;
      updateUser(currentUser);
      refreshUserUI();
      alert('🎉 Earned ₦500');
      twitterLikeBtn.disabled = true;
    }
  });

  const FIVE_MINUTES = 5 * 60 * 1000;
  let videoTimers = {};
  let videoStatus = {};

  function startWatchTimer(videoId, btn) {
    if (videoStatus[videoId]) {
      alert('You already earned for this video.');
      return;
    }
    if (videoTimers[videoId]) {
      alert('You are already watching this video.');
      return;
    }
    alert('Start watching the video. After 5 minutes, you will earn ₦500.');
    btn.disabled = true;
    videoTimers[videoId] = setTimeout(() => {
      currentUser.balance += 500;
      currentUser.videoWatched[videoId] = true;
      videoStatus[videoId] = true;
      updateUser(currentUser);
      refreshUserUI();
      alert('🎉 Earned ₦500 for watching the video!');
      btn.disabled = true;
      delete videoTimers[videoId];
    }, FIVE_MINUTES);
  }

  document.querySelectorAll('.watch-video-btn').forEach(btn => {
    btn.addEventListener('click', () => startWatchTimer(btn.dataset.videoId, btn));
  });

  inviteBtn.addEventListener('click', () => {
    if (currentUser.level >= 10) {
      alert('You have reached max level 10.');
      return;
    }
    const friendEmail = prompt('Enter friend\'s email to invite:');
    if (!friendEmail || !friendEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    currentUser.invites = (currentUser.invites || 0) + 1;
    currentUser.balance += 800;
    const newLevel = Math.min(10, Math.floor(currentUser.invites / 5) + 1);
    if (newLevel !== currentUser.level) {
      currentUser.level = newLevel;
      alert(`🎉 Congratulations! You leveled up to level ${newLevel}!`);
    } else {
      alert('🎉 Invite recorded! ₦800 credited!');
    }
    updateUser(currentUser);
    refreshUserUI();
  });

  withdrawForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in first.');
      return;
    }
    const amount = Number(withdrawAmountInput.value);
    const method = withdrawMethodSelect.value;
    const details = accountDetailsInput.value.trim();
    if (!amount || amount < 250000) {
      alert('Minimum withdrawal amount is ₦250,000.');
      return;
    }
    if (amount > currentUser.balance) {
      alert('Insufficient balance for withdrawal.');
      return;
    }
    if (!method) {
      alert('Please select a withdrawal method.');
      return;
    }
    if (details.length < 3) {
      alert('Please enter valid account details.');
      return;
    }
    currentUser.balance -= amount;
    updateUser(currentUser);
    refreshUserUI();
    alert(`Withdrawal request of ₦${amount.toLocaleString()} via ${method} received. Processing will take up to 7 days.`);
    withdrawForm.reset();
    showPage('balance');
  });

  document.getElementById('goto-withdraw-btn').addEventListener('click', () => showPage('withdraw'));
  document.getElementById('goto-earn-btn').addEventListener('click', () => showPage('earn'));

  function init() {
    currentUser = getCurrentUser();
    if (currentUser) {
      showPage('balance');
      refreshUserUI();
      tryClaimDailyLoginBonus();
      burgerBtn.style.display = 'inline-flex';
      burgerMenu.hidden = true;
      burgerBtn.setAttribute('aria-expanded', 'false');
    } else {
      showLogin();
      burgerBtn.style.display = 'none';
      burgerMenu.hidden = true;
    }
  }

  init();

  burgerBtn.addEventListener('click', () => {
    const expanded = burgerBtn.getAttribute('aria-expanded') === 'true';
    burgerBtn.setAttribute('aria-expanded', !expanded);
    burgerMenu.hidden = expanded;
  });

  burgerMenu.querySelectorAll('button[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      const page = button.getAttribute('data-page');
      showPage(page);
      burgerMenu.hidden = true;
      burgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  navButtons.logout.addEventListener('click', () => {
    logoutUser();
    currentUser = null;
    showLogin();
    burgerMenu.hidden = true;
    burgerBtn.setAttribute('aria-expanded', 'false');
  });
})();
