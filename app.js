// Strict mode
'use strict';

(() => {
  // Facebook SDK initialization
  window.fbAsyncInit = function() {
    FB.init({
      appId      : 'YOUR_FACEBOOK_APP_ID', // REPLACE with your Facebook APP ID
      cookie     : true,
      xfbml      : false,
      version    : 'v17.0'
    });
  };

  // DOM references
  const loginContainer = document.getElementById('login-container');
  const pages = {
    balance: document.getElementById('page-balance'),
    earn: document.getElementById('page-earn'),
    withdraw: document.getElementById('page-withdraw')
  };

  const navButtons = {
    balance: document.querySelector('nav#burger-menu button[data-page="balance"]'),
    earn: document.querySelector('nav#burger-menu button[data-page="earn"]'),
    withdraw: document.querySelector('nav#burger-menu button[data-page="withdraw"]'),
    logout: document.getElementById('nav-logout')
  };

  const burgerBtn = document.getElementById('burger-menu-btn');
  const burgerMenu = document.getElementById('burger-menu');

  const fbLoginBtn = document.getElementById('fb-login-btn');
  const emailLoginBtn = document.getElementById('email-login-btn');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const registerBtn = document.getElementById('register-btn');
  const regEmailInput = document.getElementById('reg-email-input');
  const regPasswordInput = document.getElementById('reg-password-input');

  const balanceAmountEl = document.getElementById('balance-amount');
  const referralLinkInput = document.getElementById('referral-link');
  const copyReferralBtn = document.getElementById('copy-referral-btn');
  const userLevelEl = document.getElementById('user-level');
  const inviteCountEl = document.getElementById('invite-count');

  const followFacebookBtn = document.getElementById('follow-facebook-btn');
  const followTwitterBtn = document.getElementById('follow-twitter-btn');
  const followYoutubeBtn = document.getElementById('follow-youtube-btn');
  const twitterLikeBtn = document.getElementById('twitter-like-btn');
  const inviteBtn = document.getElementById('invite-btn');

  const withdrawForm = document.getElementById('withdraw-form');
  const withdrawAmountInput = document.getElementById('withdraw-amount');
  const withdrawMethodSelect = document.getElementById('withdraw-method');
  const accountDetailsInput = document.getElementById('account-details');

  const storageKey = 'earnify_users';
  const loginStorageKey = 'earnify_logged_in';
  let currentUser = null;

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
    let users = getUsers();
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

  function showPage(name) {
    loginContainer.style.display = 'none';
    Object.keys(pages).forEach(key => {
      pages[key].hidden = key !== name;
    });
    burgerMenu.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    burgerBtn.style.display = 'inline-flex';
    setActiveNav(name);
  }

  function setActiveNav(name) {
    Object.keys(navButtons).forEach(key => {
      const active = key === name;
      navButtons[key].classList.toggle('active', active);
      navButtons[key].setAttribute('aria-current', active ? 'page' : 'false');
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

  function tryClaimDailyBonus() {
    if (!currentUser) return;
    const now = Date.now();
    const dayMs = 86400000;
    if (!currentUser.lastLoginBonus || now - currentUser.lastLoginBonus > dayMs) {
      currentUser.balance += 1000;
      currentUser.lastLoginBonus = now;
      updateUser(currentUser);
      refreshUserUI();
      alert("🎉 Daily login bonus ₦1000 credited!");
    }
  }

  // Authentication and button event handlers:
  fbLoginBtn.addEventListener("click", () => {
    FB.login((response) => {
      if (response.authResponse) {
        FB.api("/me", { fields: "email" }, (user) => {
          let email = user.email || `${user.id}@fb.fake`;
          const users = getUsers();
          if (!users[email]) {
            users[email] = {
              email,
              password: "",
              balance: 1000,
              invites: 0,
              level: 1,
              lastLoginBonus: 0,
              followedFacebook: false,
              followedTwitter: false,
              followedYoutube: false,
              likedRetweetedTwitter: false,
              videoWatched: {},
            };
            saveUsers(users);
          }
          currentUser = users[email];
          saveCurrentUser(currentUser);
          showPage("balance");
          refreshUserUI();
          tryClaimDailyBonus();
        });
      } else {
        alert("Facebook login cancelled or failed.");
      }
    }, { scope: "email,public_profile" });
  });

  emailLoginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim().toLowerCase();
    const pwd = passwordInput.value;
    const users = getUsers();
    if (!users[email]) {
      alert("User not found, please register.");
      return;
    }
    if (users[email].password !== pwd) {
      alert("Incorrect password.");
      return;
    }
    currentUser = users[email];
    saveCurrentUser(currentUser);
    showPage("balance");
    refreshUserUI();
    tryClaimDailyBonus();
  });

  registerBtn.addEventListener("click", () => {
    const email = regEmailInput.value.trim().toLowerCase();
    const pwd = regPasswordInput.value;
    if (!email || !pwd) {
      alert("Please enter email and password.");
      return;
    }
    const users = getUsers();
    if (users[email]) {
      alert("User already exists, please login.");
      return;
    }
    users[email] = {
      email,
      password: pwd,
      balance: 1000,
      invites: 0,
      level: 1,
      lastLoginBonus: 0,
      followedFacebook: false,
      followedTwitter: false,
      followedYoutube: false,
      likedRetweetedTwitter: false,
      videoWatched: {},
    };
    saveUsers(users);
    alert("Registration successful! Please login.");
    showLogin();
  });

  showRegisterLink.addEventListener("click", showRegister);
  showLoginLink.addEventListener("click", showLogin);

  logoutBtn.addEventListener("click", () => {
    logout();
    showLogin();
  });

  burgerBtn.addEventListener("click", () => {
    const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
    burgerBtn.setAttribute("aria-expanded", !expanded);
    burgerMenu.hidden = expanded;
  });

  navButtons.balance.addEventListener("click", () => {
    showPage("balance");
    burgerMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  });
  navButtons.earn.addEventListener("click", () => {
    showPage("earn");
    burgerMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  });
  navButtons.withdraw.addEventListener("click", () => {
    showPage("withdraw");
    burgerMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  });
  navButtons.logout.addEventListener("click", () => {
    logout();
    showLogin();
    burgerMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  });

  copyReferralBtn.addEventListener("click", () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(referralLinkInput.value).then(
        () => alert("Referral link copied!"),
        () => fallbackCopyText()
      );
    } else {
      fallbackCopyText();
    }
  });

  function fallbackCopyText() {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999);
    if (document.execCommand("copy")) alert("Referral link copied!");
    else alert("Failed to copy referral link.");
  }

  function followEarn(platform, url, key, amount, btn) {
    if (currentUser[key]) {
      alert(`Already earned ₦${amount.toLocaleString()} for following ${platform}.`);
      return;
    }
    window.open(url, "_blank", "noopener");
    if (confirm(`Confirm you followed our ${platform} page to earn ₦${amount.toLocaleString()}.`)) {
      currentUser.balance += amount;
      currentUser[key] = true;
      updateUser(currentUser);
      refreshUserUI();
      alert("🎉 Earned ₦" + amount.toLocaleString());
      btn.disabled = true;
    }
  }

  followFacebookBtn.addEventListener("click", () =>
    followEarn(
      "Facebook",
      "https://www.facebook.com/share/1CQTgX1XFw/?mibextid=qi2Omg",
      "followedFacebook",
      5000,
      followFacebookBtn
    )
  );
  followTwitterBtn.addEventListener("click", () =>
    followEarn(
      "Twitter",
      "https://twitter.com/youraccount",
      "followedTwitter",
      5000,
      followTwitterBtn
    )
  );
  followYoutubeBtn.addEventListener("click", () =>
    followEarn(
      "YouTube",
      "https://youtube.com/@learnwithugo",
      "followedYoutube",
      5000,
      followYoutubeBtn
    )
  );

  twitterLikeBtn.addEventListener("click", () => {
    if (currentUser.likedRetweetedTwitter) {
      alert("Already earned for liking & retweeting.");
      return;
    }
    window.open("https://twitter.com/youraccount/status/1234567890", "_blank", "noopener");
    if (confirm("Confirm you liked & retweeted our Twitter post to earn ₦500.")) {
      currentUser.balance += 500;
      currentUser.likedRetweetedTwitter = true;
      updateUser(currentUser);
      refreshUserUI();
      alert("🎉 Earned ₦500");
      twitterLikeBtn.disabled = true;
    }
  });

  const FIVE_MINUTES = 5 * 60 * 1000;
  let videoTimers = {};
  let videoStatus = {};

  function startWatchTimer(videoId, btn) {
    if (videoStatus[videoId]) {
      alert("Video already watched.");
      return;
    }
    if (videoTimers[videoId]) {
      alert("Already watching this video.");
      return;
    }
    alert("Watch video for 5 minutes to earn ₦500.");
    btn.disabled = true;
    videoTimers[videoId] = setTimeout(() => {
      currentUser.balance += 500;
      currentUser.videoWatched[videoId] = true;
      videoStatus[videoId] = true;
      updateUser(currentUser);
      refreshUserUI();
      alert("🎉 Earned ₦500 for watching the video!");
      btn.disabled = true;
      delete videoTimers[videoId];
    }, FIVE_MINUTES);
  }

  document.querySelectorAll(".watch-video-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      startWatchTimer(btn.getAttribute("data-video-id"), btn);
    });
  });

  inviteBtn.addEventListener("click", () => {
    if (currentUser.level >= 10) {
      alert("You have reached max level 10.");
      return;
    }
    const friendEmail = prompt("Enter friend's email to invite:");
    if (!friendEmail || !friendEmail.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }
    currentUser.invites = (currentUser.invites || 0) + 1;
    currentUser.balance += 800;
    const newLevel = Math.min(10, Math.floor(currentUser.invites / 5) + 1);
    if (newLevel !== currentUser.level) {
      currentUser.level = newLevel;
      alert(`🎉 Congratulations! You leveled up to level ${newLevel}!`);
    } else {
      alert("🎉 Invite recorded! ₦800 credited!");
    }
    updateUser(currentUser);
    refreshUserUI();
  });

  withdrawForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }
    const amount = Number(withdrawAmountInput.value);
    const method = withdrawMethodSelect.value;
    const details = accountDetailsInput.value.trim();
    if (!amount || amount < 250000) {
      alert("Minimum withdrawal amount is ₦250,000.");
      return;
    }
    if (amount > currentUser.balance) {
      alert("Insufficient balance.");
      return;
    }
    if (!method) {
      alert("Please select a withdrawal method.");
      return;
    }
    if (details.length < 3) {
      alert("Please enter valid account details.");
      return;
    }
    currentUser.balance -= amount;
    updateUser(currentUser);
    refreshUserUI();
    alert(`Withdrawal request of ₦${amount.toLocaleString()} via ${method} received. Processing up to 7 days.`);
    withdrawForm.reset();
    showPage("balance");
  });

  document.getElementById("goto-withdraw-btn").addEventListener("click", () => showPage("withdraw"));
  document.getElementById("goto-earn-btn").addEventListener("click", () => showPage("earn"));

  function init() {
    currentUser = getCurrentUser();
    if (currentUser) {
      showPage("balance");
      refreshUserUI();
      tryClaimDailyBonus();
      burgerBtn.style.display = "inline-flex";
      burgerMenu.hidden = true;
      burgerBtn.setAttribute("aria-expanded", "false");
    } else {
      showLogin();
      burgerBtn.style.display = "none";
      burgerMenu.hidden = true;
    }
  }

  burgerBtn.addEventListener("click", () => {
    const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
    burgerBtn.setAttribute("aria-expanded", !expanded);
    burgerMenu.hidden = expanded;
  });

  burgerMenu.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");
      showPage(page);
      burgerMenu.hidden = true;
      burgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  navButtons.logout.addEventListener("click", () => {
    logout();
    currentUser = null;
    showLogin();
    burgerMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("DOMContentLoaded", init);
})();
