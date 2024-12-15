import React, { useEffect, useState } from "react";
import "../styles/emailList.css";
import axios from "axios";
import { format } from "date-fns";
function EmailList() {
  const [listOfEmails, setListOfEmails] = useState([]);
  const getAllEmails = async () => {
    try {
      let listOfEmails = await axios.get("https://flipkart-email-mock.now.sh/");
      const emailsWithFormattedDate = listOfEmails.data.list.map((email) => ({
        ...email,
        formattedDate: format(new Date(email.date), "dd/MM/yyyy hh:mma"),
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
      console.log(bodyOfEmail);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllEmails();
  }, []);
  return (
    <main>
      <article className="filter-section">
        <p style={{ fontSize: "20px" }}>Fiter By:</p>
        <ul type="none">
          <li>Unread</li>
          <li>Read</li>
          <li>Favorites</li>
        </ul>
      </article>
      <section className="emails-list">
        {listOfEmails.map(
          ({ formattedDate, from, short_description, subject,id }, index) => {
            return (
              <article
                key={index}
                className="email"
                onClick={() => getEmailBody(id)}
              >
                <span>
                  {from.name.split("").slice(0, 1).toString().toUpperCase()}
                </span>
                <div>
                  <p>
                    From: {from.name} ({from.email})
                  </p>

                  <p>Subject:{subject}</p>
                  <p>{short_description}</p>
                  <p>{formattedDate}</p>
                </div>
              </article>
            );
          }
        )}
      </section>
    </main>
  );
}

export default EmailList;
