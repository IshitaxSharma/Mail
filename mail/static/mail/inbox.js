document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // submit
  document.querySelector("#compose-form").addEventListener('submit', send_mail);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
 
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';
 
      document.querySelector('#email-detail-view').innerHTML = ` 
      <ul class="list-group">
         <li class="list-group-item active"><strong>From:</strong> ${email.sender} </li>
         <li class="list-group-item"><strong>To:</strong> ${email.recipients} </li>
         <li class="list-group-item"><strong>Subject:</strong> ${email.subject} </li>
         <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp} </li>
      </ul>
      <p class="m-2">${email.body}</p>
        `
      
        // change to read
        if(!email.read){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }

        //Archive and unarchive 
        const btn_a = document.createElement('button');
        btn_a.innerHTML = email.archive ? "Unarchive": "Archive"
        btn_a.className = email.archive ? "btn btn-outline-success": "btn btn-outline-danger"
        btn_a.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })
          .then(() => { load_mailbox('archive') })
        });
        document.querySelector('#email-detail-view').append(btn_a);

        //reply

        const btn_reply = document.createElement('button');
        btn_reply.innerHTML = "Reply";
        btn_reply.className = "btn btn-outline-info";
        btn_reply.addEventListener('click', function() {
          compose_email();

          document.querySelector('#compose-recipients').value = email.sender;
          let subject = email.subject;
          if(subject.split(' ',1)[0] != "Re:"){
            subject = "Re: " + email.subject;
          }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp}  ${email.sender}  Wrote: ${email.body}`;

        });
        document.querySelector('#email-detail-view').append(btn_reply);
          });
 }

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //GET email for mail
   fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //Loop through emails 
    emails.forEach(singlemail => {
    console.log(singlemail);
    //create div
    const newmail = document.createElement('div');
    newmail.className = "list-group-item";
    newmail.innerHTML = `
      <div class="hh">
        <h6>Sender: ${singlemail.sender}</h6>
        <h5>Subject: ${singlemail.subject}</h5>
        <p>${singlemail.timestamp}</p>
      </div>
    `;
    //change color
    newmail.className = singlemail.read ? 'read': 'unread';
    // add click event

    newmail.addEventListener('click', function() {
      view_email(singlemail.id)
    });
    document.querySelector('#emails-view').append(newmail);
    });
    
  });
}

function send_mail(event){
  event.preventDefault();

  //store
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body =  document.querySelector('#compose-body').value;

  //send data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}
