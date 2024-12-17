import React, { useEffect, useState } from "react";
import "../styles/emailList.css";
import axios from "axios";
import { format } from "date-fns";

function EmailList() {
  const [listOfEmails, setListOfEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [readMails, setReadMails] = useState([]);
  const [activeButton, setActiveButton] = useState("All");

  // Load emails per page
  const emailsPerPage = 5;

  // Save data to localStorage
  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Load data from localStorage
  const loadFromLocalStorage = (key, defaultValue) => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  };

  const getAllEmails = async () => {
    try {
      let response = await axios.get("https://flipkart-email-mock.now.sh/");
      const emailsWithFormattedDate = response.data.list.map((email) => ({
        ...email,
        formattedDate: format(new Date(email.date), "dd/MM/yyyy hh:mma"),
        read: false,
      }));
      setListOfEmails(emailsWithFormattedDate);
      saveToLocalStorage("listOfEmails", emailsWithFormattedDate); // Save to localStorage
    } catch (error) {
      console.log(error);
    }
  };
  console.log(listOfEmails, "listOfEmails");

  const getEmailBody = async (id) => {
    try {
      let response = await axios.get(
        ` https://flipkart-email-mock.now.sh/?id=${id}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const handleEmailClick = async (id) => {
    try {
      const emailIndex = listOfEmails.findIndex((email) => email.id === id);
      if (emailIndex === -1) return;

      const body = await getEmailBody(id);
      const updatedEmail = { ...listOfEmails[emailIndex], body, read: true };
      const updatedList = [...listOfEmails];
      updatedList[emailIndex] = updatedEmail;
      setListOfEmails(updatedList);

      // Add to read emails if not already present
      setReadMails((prev) =>
        prev.some((email) => email.id === id) ? prev : [...prev, updatedEmail]
      );

      // Calculate unread emails and save to localStorage
      const unreadEmails = updatedList.filter((email) => !email.read);

      saveToLocalStorage("listOfEmails", updatedList); // Save updated list to localStorage
      saveToLocalStorage("readMails", readMails); // Save read emails
      saveToLocalStorage("unreadEmails", unreadEmails); // Save unread emails

      setSelectedEmail(updatedEmail);
    } catch (error) {
      console.error("Error handling email click:", error);
    }
  };

  const showFavorites = () => {
    setListOfEmails(favorites);
  };

  const showRead = () => {
    const sortedReadEmails = [...readMails].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setListOfEmails(sortedReadEmails);
  };

  const showUnread = () => {
    const savedUnreadEmails = loadFromLocalStorage("unreadEmails");
    if (savedUnreadEmails) {
      setListOfEmails(savedUnreadEmails);
    } else if (!savedUnreadEmails) {
      // Fallback to calculating unread emails if not found in localStorage
      const unreadEmails = listOfEmails.filter((email) => !email.read);
      setListOfEmails(unreadEmails);
    }
  };

  useEffect(() => {
    const savedEmails = loadFromLocalStorage("listOfEmails");
    const savedReadMails = loadFromLocalStorage("readMails");
    const savedUnreadEmails = loadFromLocalStorage("unreadEmails");

    if (savedEmails) setListOfEmails(savedEmails);
    if (savedReadMails) setReadMails(savedReadMails);
    if (savedUnreadEmails) {
      // Optional: Ensure consistency with the current list of emails
      const updatedUnread = savedEmails
        ? savedEmails.filter((email) => !email.read)
        : savedUnreadEmails;
      saveToLocalStorage("unreadEmails", updatedUnread);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage("favorites", favorites);
  }, [favorites]);

  useEffect(() => {
    saveToLocalStorage("activeButton", activeButton);
  }, [activeButton]);

  return (
    <main>
      {/* top section */}
      <section className="top-section">
        {/* filter section */}
        <article className="filter-section">
          <p style={{ color: "black" }}>Filter By:</p>
          <ul type="none">
            <li className={activeButton === "All" ? "active" : ""}>
              <button
                onClick={() => {
                  getAllEmails();
                  setActiveButton("All");
                  setSelectedEmail(null);
                }}
              >
                All
              </button>
            </li>
            <li className={activeButton === "unread" ? "active" : ""}>
              <button
                onClick={() => {
                  showUnread();
                  setActiveButton("unread");
                  setSelectedEmail(null);
                }}
              >
                Unread
              </button>
            </li>
            <li className={activeButton === "read" ? "active" : ""}>
              <button
                onClick={() => {
                  showRead();
                  setActiveButton("read");
                  setSelectedEmail(null);
                }}
              >
                Read
              </button>
            </li>
            <li className={activeButton === "fav" ? "active" : ""}>
              <button
                onClick={() => {
                  showFavorites();
                  setActiveButton("fav");
                  setSelectedEmail(null);
                }}
              >
                Favorites
              </button>
            </li>
          </ul>
        </article>
      </section>
      {/* bottom section */}
      <section
        className="bottom-section"
        style={{
          flexDirection: selectedEmail ? "row" : "column",
        }}
      >
        {/* email list */}
        <section
          className="emails-list"
          style={{
            width: selectedEmail ? "35%" : "100%",
          }}
        >
          {listOfEmails.map(
            (
              { formattedDate, from, short_description, subject, id },
              index
            ) => (
              <article
                key={index}
                // className="email"
                className={`email ${listOfEmails[index].read ? "read" : ""}`}
                onClick={() => handleEmailClick(id)}
                style={{
                  borderColor: selectedEmail?.id === id ? "#e54065" : "#cfd2dc",
                }}
              >
                <span className="logo">
                  {from.name.split("").slice(0, 1).toString().toUpperCase()}
                </span>
                <div>
                  <p>
                    From:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {from.name} ({from.email})
                    </span>
                  </p>
                  <p>
                    Subject:{" "}
                    <span style={{ fontWeight: "bold" }}>{subject}</span>
                  </p>
                  <p>{short_description}</p>
                  <p>
                    {formattedDate}
                    {favorites.find((fav) => fav.id === id) && (
                      <span id="fav-tag">Favorite</span>
                    )}
                  </p>
                </div>
              </article>
            )
          )}
        </section>
        {/* email body */}
        {selectedEmail && (
          <section className="email-body">
            <article className="header">
              <span className="logo">
                {selectedEmail.from.name
                  .split("")
                  .slice(0, 1)
                  .toString()
                  .toUpperCase()}
              </span>
              <p style={{ fontWeight: "bold" }}>{selectedEmail.subject}</p>
              <button
                id="fav-mark"
                onClick={() => {
                  setFavorites([...favorites, selectedEmail]);
                }}
                disabled={favorites.some((fav) => fav.id === selectedEmail.id)}
                className={
                  favorites.some((fav) => fav.id === selectedEmail.id)
                    ? "button-disabled"
                    : "button-default"
                }
              >
                Mark as favorite
              </button>
            </article>
            <p>{selectedEmail.formattedDate}</p>
            <article className="content">
              {selectedEmail.body.body
                .replace(/^<div>/, "")
                .replace(/<\/div>$/, "")
                .split(/<\/?p>/)
                .filter((text) => text.trim() !== "")
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

export default EmailList;
