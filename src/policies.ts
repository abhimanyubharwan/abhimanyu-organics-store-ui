// The store's policies, carried over word for word from the pages published on
// abhimanyuorganics.com (Hostinger Website Builder), at the same addresses so
// existing links keep working. Change the wording here, not in the page.

export interface PolicyBlock {
  h?: string;
  p?: string;
  ul?: string[];
}

export interface Policy {
  title: string;
  blocks: PolicyBlock[];
}

export const POLICIES: Record<"refund-policy" | "privacy-policy" | "terms-and-conditions", Policy> = {
  "refund-policy": {
    title: "Returns & Refunds Policy",
    blocks: [
      { p: "You are entitled to cancel your order within 5 days without giving any reason for doing so." },
      { p: "The deadline for canceling an order is 5 days from the date you received the goods or on which a third party you have appointed, who is not the carrier, takes possession of the product delivered." },
      { p: "In order to exercise your right of cancellation, you must inform us of your decision by means of a clear statement." },
      { p: "You can inform us of your decision by e-mail organicsabhimanyu@gmail.com" },
      { p: "We will reimburse you no later than 45 days from the day on which we receive the returned goods. We will use the same means of payment as you used for the order, and you will not incur any fees for such reimbursement." },
      { h: "Conditions for returns" },
      { p: "In order for the goods to be eligible for a return, please make sure that:" },
      { ul: ["The goods were purchased in the last 15 days", "The goods are in the original packaging"] },
      { p: "The following goods cannot be returned:" },
      {
        ul: [
          "The supply of goods made to your specifications or clearly personalized.",
          "The supply of goods which according to their nature are not suitable to be returned, for example goods which deteriorate rapidly or where the date of expiry is over.",
          "The supply of goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery.",
          "The supply of goods which are, after delivery, according to their nature, inseparably mixed with other items.",
        ],
      },
      { p: "We reserve the right to refuse returns of any merchandise that does not meet the above return conditions at our sole discretion." },
      { h: "Returning Goods" },
      { p: "You are responsible for the cost and risk of returning the goods to us. You should send the goods to the following address:" },
      { p: "#457, Suresh Kumar Bharwan, Panihar Chak, Hisar, Haryana 125001" },
      { p: "We cannot be held responsible for goods damaged or lost in return shipment. Therefore, we recommend an insured and trackable mail service. We are unable to issue a refund without actual receipt of the goods or proof of received return delivery." },
      { h: "Gifts" },
      { p: "If the goods were marked as a gift when purchased and then shipped directly to you, you'll receive a gift credit for the value of your return. Once the returned product is received, a gift certificate will be mailed to you." },
      { p: "If the goods weren't marked as a gift when purchased, or the gift giver had the order shipped to themselves to give it to you later, We will send the refund to the gift giver." },
      { h: "Contact Us" },
      { p: "If you have any questions about our Returns and Refunds Policy, please contact us by e-mail organicsabhimanyu@gmail.com" },
    ],
  },

  "privacy-policy": {
    title: "Privacy Policy",
    blocks: [
      { p: "Abhimanyu Organics & Honey Farm website is owned by Abhimanyu Organics, which is a data controller of your personal data." },
      { p: "We have adopted this Privacy Policy, which determines how we are processing the information collected by Abhimanyu Organics & Honey Farm, which also provides the reasons why we must collect certain personal data about you. Therefore, you must read this Privacy Policy before using Abhimanyu Organics & Honey Farm website." },
      { p: "We take care of your personal data and undertake to guarantee its confidentiality and security." },
      { h: "Personal information we collect" },
      { p: "When you visit the Abhimanyu Organics & Honey Farm, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the installed cookies on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products you view, what websites or search terms referred you to the Site, and how you interact with the Site. We refer to this automatically-collected information as “Device Information.” Moreover, we might collect the personal data you provide to us (including but not limited to Name, Surname, Address, payment information, etc.) during registration to be able to fulfill the agreement." },
      { h: "Why do we process your data?" },
      { p: "Our top priority is customer data security, and, as such, we may process only minimal user data, only as much as it is absolutely necessary to maintain the website. Information collected automatically is used only to identify potential cases of abuse and establish statistical information regarding website usage. This statistical information is not otherwise aggregated in such a way that it would identify any particular user of the system." },
      { p: "You can visit the website without telling us who you are or revealing any information, by which someone could identify you as a specific, identifiable individual. If, however, you wish to use some of the website’s features, or you wish to receive our newsletter or provide other details by filling a form, you may provide personal data to us, such as your email, first name, last name, city of residence, organization, telephone number. You can choose not to provide us with your personal data, but then you may not be able to take advantage of some of the website’s features. For example, you won’t be able to receive our Newsletter or contact us directly from the website. Users who are uncertain about what information is mandatory are welcome to contact us via organicsabhimanyu@gmail.com." },
      { h: "Your rights" },
      { p: "If you are a European resident, you have the following rights related to your personal data:" },
      {
        ul: [
          "The right to be informed.",
          "The right of access.",
          "The right to rectification.",
          "The right to erasure.",
          "The right to restrict processing.",
          "The right to data portability.",
          "The right to object.",
          "Rights in relation to automated decision-making and profiling.",
        ],
      },
      { p: "If you would like to exercise this right, please contact us through the contact information below." },
      { p: "Additionally, if you are a European resident, we note that we are processing your information in order to fulfill contracts we might have with you (for example, if you make an order through the Site), or otherwise to pursue our legitimate business interests listed above. Additionally, please note that your information might be transferred outside of Europe, including Canada and the United States." },
      { h: "Links to other websites" },
      { p: "Our website may contain links to other websites that are not owned or controlled by us. Please be aware that we are not responsible for such other websites or third parties' privacy practices. We encourage you to be aware when you leave our website and read the privacy statements of each website that may collect personal information." },
      { h: "Information security" },
      { p: "We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We keep reasonable administrative, technical, and physical safeguards to protect against unauthorized access, use, modification, and personal data disclosure in its control and custody. However, no data transmission over the Internet or wireless network can be guaranteed." },
      { h: "Legal disclosure" },
      { p: "We will disclose any information we collect, use or receive if required or permitted by law, such as to comply with a subpoena or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request." },
      { h: "Contact information" },
      { p: "If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Information, you may send an email to organicsabhimanyu@gmail.com." },
    ],
  },

  "terms-and-conditions": {
    title: "Terms and Conditions",
    blocks: [
      { p: "Welcome to Abhimanyu Organics & Honey Farm!" },
      { p: "These terms and conditions outline the rules and regulations for the use of Abhimanyu Organics Website, located at https://abhimanyuorganics.com." },
      { p: "By accessing this website, we assume you accept these terms and conditions. Do not continue to use Abhimanyu Organics & Honey Farm if you do not agree to take all of the terms and conditions stated on this page." },
      { h: "Cookies" },
      { p: "The website uses cookies to help personalize your online experience. By accessing Abhimanyu Organics & Honey Farm, you agreed to use the required cookies." },
      { p: "A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you and can only be read by a web server in the domain that issued the cookie to you." },
      { p: "We may use cookies to collect, store, and track information for statistical or marketing purposes to operate our website. You have the ability to accept or decline optional Cookies. There are some required Cookies that are necessary for the operation of our website. These cookies do not require your consent as they always work. Please keep in mind that by accepting required Cookies, you also accept third-party Cookies, which might be used via third-party provided services if you use such services on our website, for example, a video display window provided by third parties and integrated into our website." },
      { h: "License" },
      { p: "Unless otherwise stated, Abhimanyu Organics and/or its licensors own the intellectual property rights for all material on Abhimanyu Organics & Honey Farm. All intellectual property rights are reserved. You may access this from Abhimanyu Organics & Honey Farm for your own personal use subjected to restrictions set in these terms and conditions." },
      { p: "You must not:" },
      {
        ul: [
          "Copy or republish material from Abhimanyu Organics & Honey Farm",
          "Sell, rent, or sub-license material from Abhimanyu Organics & Honey Farm",
          "Reproduce, duplicate or copy material from Abhimanyu Organics & Honey Farm",
          "Redistribute content from Abhimanyu Organics & Honey Farm",
        ],
      },
      { p: "This Agreement shall begin on the date hereof." },
      { p: "Parts of this website offer users an opportunity to post and exchange opinions and information in certain areas of the website. Abhimanyu Organics does not filter, edit, publish or review Comments before their presence on the website. Comments do not reflect the views and opinions of Abhimanyu Organics, its agents, and/or affiliates. Comments reflect the views and opinions of the person who posts their views and opinions. To the extent permitted by applicable laws, Abhimanyu Organics shall not be liable for the Comments or any liability, damages, or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website." },
      { p: "Abhimanyu Organics reserves the right to monitor all Comments and remove any Comments that can be considered inappropriate, offensive, or causes breach of these Terms and Conditions." },
      { p: "You warrant and represent that:" },
      {
        ul: [
          "You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;",
          "The Comments do not invade any intellectual property right, including without limitation copyright, patent, or trademark of any third party;",
          "The Comments do not contain any defamatory, libelous, offensive, indecent, or otherwise unlawful material, which is an invasion of privacy.",
          "The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.",
        ],
      },
      { p: "You hereby grant Abhimanyu Organics a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats, or media." },
      { h: "Hyperlinking to our Content" },
      { p: "The following organizations may link to our Website without prior written approval:" },
      {
        ul: [
          "Government agencies;",
          "Search engines;",
          "News organizations;",
          "Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and",
          "System-wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.",
        ],
      },
      { p: "These organizations may link to our home page, to publications, or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party's site." },
      { p: "We may consider and approve other link requests from the following types of organizations:" },
      {
        ul: [
          "Commonly-known consumer and/or business information sources;",
          "Dot.com community sites;",
          "Associations or other groups representing charities;",
          "Online directory distributors;",
          "Internet portals;",
          "Accounting, law, and consulting firms; and",
          "Educational institutions and trade associations.",
        ],
      },
      { p: "We will approve link requests from these organizations if we decide that: (a) the link would not make us look unfavorably to ourselves or to our accredited businesses; (b) the organization does not have any negative records with us; (c) the benefit to us from the visibility of the hyperlink compensates the absence of Abhimanyu Organics Private Limited; and (d) the link is in the context of general resource information." },
      { p: "These organizations may link to our home page so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval of the linking party and its products or services; and (c) fits within the context of the linking party's site." },
      { p: "If you are one of the organizations listed in paragraph 2 above and are interested in linking to our website, you must inform us by sending an e-mail to Abhimanyu Organics. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our Website, and a list of the URLs on our site to which you would like to link. Wait 2-3 weeks for a response." },
      { p: "Approved organizations may hyperlink to our Website as follows:" },
      {
        ul: [
          "By use of our corporate name; or",
          "By use of the uniform resource locator being linked to; or",
          "Using any other description of our Website being linked to that makes sense within the context and format of content on the linking party's site.",
        ],
      },
      { p: "No use of Abhimanyu Organics logo or other artwork will be allowed for linking absent a trademark license agreement." },
      { h: "Content Liability" },
      { p: "We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are raised on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene, or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights." },
      { h: "Reservation of Rights" },
      { p: "We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amend these terms and conditions and its linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions." },
      { h: "Removal of links from our website" },
      { p: "If you find any link on our Website that is offensive for any reason, you are free to contact and inform us at any moment. We will consider requests to remove links, but we are not obligated to or so or to respond to you directly." },
      { p: "We do not ensure that the information on this website is correct. We do not warrant its completeness or accuracy, nor do we promise to ensure that the website remains available or that the material on the website is kept up to date." },
      { h: "Disclaimer" },
      { p: "To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:" },
      {
        ul: [
          "Limit or exclude our or your liability for death or personal injury;",
          "Limit or exclude our or your liability for fraud or fraudulent misrepresentation;",
          "Limit any of our or your liabilities in any way that is not permitted under applicable law; or",
          "Exclude any of our or your liabilities that may not be excluded under applicable law.",
        ],
      },
      { p: "The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort, and for breach of statutory duty." },
      { p: "As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature." },
    ],
  },
};
