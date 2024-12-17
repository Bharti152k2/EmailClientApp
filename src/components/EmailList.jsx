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
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 5;
  console.log(listOfEmails, "listOfEmails");
  console.log(selectedEmail, "selectedEmail");
  const getAllEmails = async () => {
    try {
      let listOfEmails = await axios.get("https://flipkart-email-mock.now.sh/");
      const emailsWithFormattedDate = listOfEmails.data.list.map((email) => ({
        ...email,
        formattedDate: format(new Date(email.date), "dd/MM/yyyy hh:mma"),
        read: false,
      }));
      setListOfEmails(emailsWithFormattedDate);
    } catch (error) {
      console.log(error);
    }
  };

  const getEmailBody = async (id) => {
    try {
      let bodyOfEmail = await axios.get(
        `https://flipkart-email-mock.now.sh/?id=${id}`
      );
      return bodyOfEmail.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailClick = async (id) => {
    try {
      const emailIndex = listOfEmails.findIndex((email) => email.id === id);
      console.log("emailIndex", emailIndex);
      if (emailIndex === -1) return;
      const body = await getEmailBody(id);
      const updatedEmail = { ...listOfEmails[emailIndex], body, read: true };
      console.log("updatedEmail", updatedEmail);
      const updatedList = [...listOfEmails];
      console.log("updatedList", updatedList);
      updatedList[emailIndex] = updatedEmail;
      setListOfEmails(updatedList);

      setSelectedEmail(updatedEmail);
    } catch (error) {
      console.error("Error handling email click:", error);
    }
  };

  const showFavorites = () => {
    setListOfEmails(favorites);
  };
  const showRead = () => {
    const readEmails = listOfEmails.filter((email) => email.read);
    setListOfEmails((prevReadMails) => [...prevReadMails, ...readEmails]);
  };
  useEffect(() => {
    getAllEmails();
    console.log("getAllEmails", getAllEmails);
  }, []);

  return (
    <main>
      {/* top section */}
      <section className="top-section">
        {/* filter section */}
        <article className="filter-section">
          <p style={{ color: "black" }}>Fiter By:</p>
          <ul type="none">
            <li className={activeButton === "All" && "active"}>
              <button
                onClick={() => {
                  getAllEmails();
                  setActiveButton("All");
                }}
              >
                All
              </button>
            </li>
            <li className={activeButton === "unread" && "active"}>
              <button
                onClick={() => {
                  setActiveButton("unread");
                }}
              >
                Unread
              </button>
            </li>
            <li className={activeButton === "read" && "active"}>
              <button
                onClick={() => {
                  showRead();
                  setActiveButton("read");
                }}
              >
                Read
              </button>
            </li>
            <li className={activeButton === "fav" && "active"}>
              <button
                onClick={() => {
                  showFavorites();
                  setActiveButton("fav");
                }}
              >
                Favorites
              </button>
            </li>
          </ul>
        </article>
      </section>
      {/* bottom secttion */}
      <section
        className="bottom-section"
        style={{
          flexDirection: selectedEmail ? "row" : "column",
        }}
      >
        {/* email list  */}
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
            ) => {
              return (
                <article
                  key={index}
                  className="email"
                  onClick={() => handleEmailClick(id)}
                  style={{
                    borderColor:
                      selectedEmail?.id === id ? "#e54065" : "#cfd2dc",
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
              );
            }
          )}
        </section>
        {/* email body  */}
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
