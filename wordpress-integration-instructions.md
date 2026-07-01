# 🏁 ERIC 2026 Registration Portal - WordPress Authentication & Integration Guide

This guide describes how to connect your **WordPress Membership Site** to the **ERIC 2026 Registration Portal**. 

By using standard WordPress hooks and the pre-styled CSS/JS files created in this project, **any user who logs in on any device on your WordPress site will be instantly and securely authenticated under their own account details on the Registration Portal!**

---

## 🏗️ Step 1: Deploying the Custom Modular Sections in Elementor (NEW)

As requested, we have broken down the portal into **individual, beautiful, responsive, and self-contained HTML files** that you can copy and paste one by one into **Elementor "HTML" widgets**:

1. **Custom Top Navbar** (`/wordpress-navbar.html`):
   - Features the cyber brand design, neon glows, and a responsive toggle menu for mobile/tablet devices.
   - If a visitor tries to sign in, clicking the button displays an elegant pop-up modal stating that: **"Login will be allowed later."**
2. **Custom Landing Hero** (`/wordpress-hero.html`):
   - Displays the master title **"SECURE YOUR SLOT IN THE ARENA"**.
   - Includes full-grid vector metrics and adaptive container paddings.
   - If a user clicks or touches **"ENTER TOURNAMENT REGISTRATION"**, an elegant pop-up is triggered stating that: **"The registration will open later, please wait!"**
3. **Custom Divisions & Arena Categories** (`/wordpress-divisions.html`):
   - Details active contest categories (Sumobot 500g, Sumobot 1kg, Drone Crash).
   - Touching any division registration triggers the pop-up modal informing the user that **"The registration will open later, please wait!"**
4. **Custom Interactive Footer** (`/wordpress-footer.html`):
   - A multi-column professional grid for social links, help desk targets, and system diagnostics metrics with custom trademark statements.

These modules include Tailwind CSS CDNs, custom monospace fonts, and interactive scripts built-in, so they load flawlessly inside Elementor canvas zones across desktops, laptops, tablets, and phones!

---

## 🔒 Step 2: How the Interactive Custom Login Drawer Works

Inside the custom landing page:
- Clicking **SIGN IN TO PORTAL** or **ENTER TOURNAMENT REGISTRATION** triggers a smooth sliding animation opening a secure Login Drawer.
- Standard input fields (Username or Email, Secure Password, and Remember Me) are displayed inside the drawer.
- The form `action` is set dynamically by JavaScript to `window.location.origin + '/wp-login.php'`, meaning it automatically targets your WordPress SQL backend.
- When submitted, WordPress performs its standard secure authentication checks.
- Because we included a hidden `<input type="hidden" name="redirect_to" value="/registration-portal.html">` parameter, WordPress will authorize the password, configure the local secure user cookies, and immediately redirect the user straight to the team registration portal under their own verified profile!

---

## 🎨 Step 3: Optional Login Screen Skinning (For Standard wp-login.php fallback)

If users skip the drawer and fall back to the standard `/wp-login.php` screen, you can skin it to look exactly like the main portal using the files we created:

### A. Paste the Custom CSS Rules
1. Copy all the styles listed inside `/wordpress-login-style.css`.
2. Go to your WordPress Dashboard -> **Appearance** -> **Login Customizer** -> **Additional CSS** (or your Simple CSS plugin like *Simple Custom CSS and JS*).
3. Paste the CSS code and hit **Save/Publish**. This skins the default WordPress login page with the dark futuristic theme, neon-emerald border glows, custom fonts, and high-contrast submit button styles matching the main portal.

### B. Paste the Custom JavaScript Deco
1. Copy all the script lines listed inside `/wordpress-login-script.js`.
2. Paste it into the **Footer JS** section of your customizer plugin.
3. This script replaces default WordPress brand names with `'ERIC CHAMPIONSHIP 2026'`, alters links, and adds a beautifully integrated live timestamp status widget above your login fields.

---

## ⚙️ Step 4: Add the Automatic Redirection Filter to `functions.php`

To securely grab the authorized user details (Name & Email) from the WordPress database and send them dynamically to the registration portal, add the following PHP code block to your WordPress theme's `functions.php` file (or insert it as a **PHP Snippet** using the free **WPCode** plugin):

```php
<?php
/**
 * AUTO-REDIRECT SUCCESSFUL LOGIN SESSIONS TO registration-portal.html
 * PASSING AUTHENTICATED USER COORDINATES DYNAMICALLY TO PREVENT FALLBACK LOGINS
 */
add_filter('login_redirect', 'eric_championship_login_redirect', 10, 3);

function eric_championship_login_redirect($redirect_to, $request, $user) {
    if (isset($user->ID)) {
        // Retrieve the accurate display name and email address of the authenticated WordPress user
        $user_name  = urlencode($user->display_name);
        $user_email = urlencode($user->user_email);
        
        // Define your relative or absolute path where the ERIC registration portal is located!
        // (You can point this straight to your main homepage or custom landing template address!)
        $portal_base_url = 'https://' . $_SERVER['HTTP_HOST'] . '/wordpress-custom-landing.html';
        
        // Build the dynamic secure hand-shake query parameters
        $secure_destination = $portal_base_url . "?wp_user=" . $user_name . "&wp_email=" . $user_email;
        
        return $secure_destination;
    }
    return $redirect_to;
}
```

---

## 🗄️ Step 5: Storage and Database Systems

* **User Accounts & Passwords**: Handled 100% securely by WordPress's core database.
* **Roster Ledger Persistence**: The saved team registries persist securely on your users' local browsers (`localStorage` caching). When the user clicks the **Download Excel Spreadsheet** layout inside the portal, their generated registers are compiled instantaneously into dynamic Multi-Sheet Excel files (`.xlsx`) which they can save or send to you!

