// An array of links for navigation bar
const navBarLinks = [
  { name: "Home", url: "/" },
  { name: "Work", url: "/products" },
  { name: "Services", url: "/services" },
  { name: "Blog", url: "/blog" },
  { name: "Contact", url: "/contact" },
];
// An array of links for footer
const footerLinks = [
  {
    section: "Ecosystem",
    links: [
      { name: "Docs", url: "/welcome-to-docs/" },
      { name: "Tools", url: "/products" },
      { name: "Commission", url: "/services" },
    ],
  },
  {
    section: "About",
    links: [
      { name: "About ely", url: "#" },
      { name: "Blog", url: "/blog" },
      { name: "Collab", url: "#" },
      { name: "Patrons", url: "#" },
    ],
  },
];
// An object of links for social icons
const socialLinks = {
  facebook: "https://www.facebook.com/elykahn",
  x: "https://twitter.com/creativ_ely",
  github: "https://github.com/elykahn/screwfast",
  google: "ely.kahn@gmail.com",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};
