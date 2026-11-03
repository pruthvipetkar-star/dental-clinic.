# Dental Clinic Website Template — Customization Guide

Welcome! This guide explains how to customize your dental clinic website with your own branding, doctor details, services, contact information, and images.

## 1. Requirements

Before starting, install:

- Node.js (LTS version)
- Visual Studio Code
- A modern web browser

## 2. Install the Project

1. Open the project folder in VS Code.
2. Open the VS Code terminal.
3. Run:

```bash
npm install
```

4. Create your environment file by copying `.env.example` and naming the copy `.env`.
5. Configure the required environment variables using the instructions in `.env.example`.
6. Start the website:

```bash
node server.js
```

7. Open `http://localhost:3000` in your browser.

Keep the terminal open while using the website.

## 3. Customize Clinic Information

Open:

`public/clinic-config.js`

This is the main customization file.

Update the values for:

- `clinicName` — Your clinic's name.
- `tagline` — Your clinic's tagline.
- `heroHeading` — Main homepage heading.
- `heroDescription` — Homepage introduction.
- `doctorName` — Doctor's name.
- `doctorQualification` — Verified professional qualification.
- `address` — Clinic address.
- `city` — City.
- `state` — State.
- `phone` — Clinic contact number.
- `email` — Clinic email address.
- `openingHours` — Confirmed clinic opening hours.

Replace the example information with accurate clinic details.

## 4. Customize Services

In `public/clinic-config.js`, find the `services` array.

Each service contains:

- `title`
- `description`

Edit the existing entries to match the treatments actually offered by your clinic.

You can also change `servicesHeading`.

## 5. Change Images

Open the `public` folder.

Replace the demo images with your own clinic-approved images.

Keep the existing filenames when replacing images, so the website can continue finding them.

Check the image references in the HTML and configuration file before renaming any image.

Use images that you own or have permission to use.

## 6. Customize Footer Information

In `public/clinic-config.js`, update:

- `footerLogo`
- `footerDescription`
- `footerBookingButton`

Also update the clinic contact information in the main configuration.

## 7. Configure Appointment Emails

The appointment email system uses the server's environment configuration.

Open `.env.example` to see the required variable names.

Create and configure your private `.env` file with your own email settings.

Never share your `.env` file or publish email passwords, app passwords, or other credentials.

Test appointment notifications before using the website with real customers.

## 8. Admin Dashboard

The admin dashboard allows authorized clinic staff to manage appointment requests.

Before handing over the website:

- Set a unique admin password.
- Keep login credentials private.
- Test admin login and logout.
- Test appointment viewing and status updates.
- Confirm that unauthorized visitors cannot access appointment data.

## 9. Final Testing Checklist

Before publishing the website:

- [ ] Clinic name and branding are correct.
- [ ] Doctor details are accurate.
- [ ] Services and descriptions are correct.
- [ ] Contact details are correct.
- [ ] Opening hours are confirmed.
- [ ] Images display correctly.
- [ ] Website works on mobile and desktop.
- [ ] Appointment form works.
- [ ] Email notifications work.
- [ ] Admin login works.
- [ ] Appointment management works.
- [ ] Private credentials are not included in the delivery package.

## 10. Important Notes

- Keep a backup before making major changes.
- Do not publish your `.env` file.
- Do not use unverified doctor qualifications or clinic information.
- Obtain permission for all clinic photographs, logos, and other content.
- Have the clinic review the website before making it public.
- Configure suitable hosting, HTTPS, backups, and privacy protections before handling real patient information.

**Your website is now ready for clinic-specific customization.**