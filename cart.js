document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form submission

  const inputBox = document.getElementById('input-box');
  const inputValue = inputBox.value.trim();

  if (inputValue !== '') {
      // Create a new list item
      const newItem = document.createElement('li');

      // Create a span for the text
      const textSpan = document.createElement('span');
      textSpan.textContent = inputValue;

      // Create the edit and delete icons using your specific images
      const editIcon = document.createElement('img');
      editIcon.src = 'image/OIP (2).jpg'; // Image path relative to the HTML file
      editIcon.className = 'emoji';

      const deleteIcon = document.createElement('img');
      deleteIcon.src = 'image/OIP (4).jpg'; // Image path relative to the HTML file
      deleteIcon.className = 'emoji';

      // Add click functionality for the edit icon to show a message
      editIcon.addEventListener('click', function() {
          alert('Done, good job!'); // Show alert message
      });

      // Add click functionality for delete icon
      deleteIcon.addEventListener('click', function() {
          newItem.remove(); // Remove the item
      });

      // Append the text and icons to the list item
      newItem.appendChild(textSpan);
      newItem.appendChild(editIcon);
      newItem.appendChild(deleteIcon);

      // Append the new item to the list
      document.getElementById('List').appendChild(newItem);

      // Clear the input box
      inputBox.value = '';
  }
});

// Clear all items when "Clear Items" is clicked
document.getElementById('clear-items').addEventListener('click', function() {
  document.getElementById('List').innerHTML = '';
});
