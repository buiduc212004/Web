// Customer handler functions
console.log('Customer handler script loaded');

// Global variable for customers
let customers = JSON.parse(localStorage.getItem('allCustomers') || '[]');

// Function to open the customer modal
function openCustomerModal(mode) {
    console.log('Opening customer modal');
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        console.log('Modal opened successfully');
    } else {
        console.error('Customer modal element not found');
    }
}

// Function to close the customer modal
function closeCustomerModal() {
    console.log('Closing customer modal');
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reset the form
        const form = document.getElementById('customer-form');
        if (form) {
            form.reset();
        }
        console.log('Modal closed successfully');
    } else {
        console.error('Customer modal element not found');
    }
}

// Function to save new customer
function saveCustomer() {
    console.log('Saving customer...');
    
    const form = document.getElementById('customer-form');
    if (!form) {
        alert('Customer form not found!');
        return false;
    }
    
    // Get form values
    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const phone = form.elements['phone'].value.trim();
    const address = form.elements['address'].value.trim();
    const status = form.elements['status'].value;
    
    // Validate data
    if (!name) {
        alert('Please enter a name');
        return false;
    }
    
    if (!email) {
        alert('Please enter an email');
        return false;
    }
    
    if (!phone) {
        alert('Please enter a phone number');
        return false;
    }
    
    if (!address) {
        alert('Please enter an address');
        return false;
    }
    
    // Create new customer object
    const newCustomer = {
        id: 'CUST-' + (Math.floor(Math.random() * 10000)).toString().padStart(4, '0'),
        name: name,
        email: email,
        phone: phone,
        address: address,
        status: status,
        orders: 0,
        totalSpent: 0,
        joinedDate: new Date().toLocaleDateString('en-GB'),
        lastOrder: 'N/A'
    };
    
    try {
        // Add to customers array
        customers.push(newCustomer);
        
        // Save to localStorage
        localStorage.setItem('allCustomers', JSON.stringify(customers));
        
        // Show success message
        alert('Customer added successfully!');
        
        // Reset the form
        form.reset();
        
        // Close modal 
        closeCustomerModal();
        
        // Display the customer in the table without page reload
        displayCustomers();
        
        console.log('Customer saved successfully:', newCustomer);
        return true;
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('There was an error saving the customer. Please try again.');
        return false;
    }
}

// Function to display customers in the table
function displayCustomers() {
    const tableBody = document.querySelector('#customers-table tbody');
    if (!tableBody) {
        console.error('Customer table not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Display customers
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.orders}</td>
            <td>${customer.totalSpent} đ</td>
            <td><span class="status-badge ${customer.status}">${customer.status}</span></td>
            <td class="actions">
                <button class="action-btn view-btn" data-id="${customer.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${customer.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${customer.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to delete a customer
function deleteCustomer(customerId) {
    // Filter out the customer to delete
    customers = customers.filter(c => c.id !== customerId);
    
    // Update localStorage
    localStorage.setItem('allCustomers', JSON.stringify(customers));
    
    // Refresh the display
    displayCustomers();
}

// Set up all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up customer handlers');
    
    // Load and display initial customers
    displayCustomers();
    
    // Add Customer button - open modal
    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openCustomerModal();
        });
        console.log('Add Customer button handler set up');
    } else {
        console.error('Add Customer button not found');
    }
    
    // Save Customer button - save data 
    const saveBtn = document.getElementById('save-customer-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCustomer);
        console.log('Save Customer button handler set up');
    } else {
        console.error('Save Customer button not found');
    }
    
    // Cancel button - close modal
    const cancelBtn = document.getElementById('cancel-customer-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCustomerModal);
        console.log('Cancel button handler set up');
    } else {
        console.error('Cancel button not found');
    }
    
    // X close button - close modal
    const closeX = document.getElementById('modal-close-x');
    if (closeX) {
        closeX.addEventListener('click', closeCustomerModal);
        console.log('Close X button handler set up');
    } else {
        console.error('Close X button not found');
    }
    
    // Click outside modal to close
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCustomerModal();
            }
        });
        console.log('Modal background click handler set up');
    } else {
        console.error('Customer modal not found');
    }
    
    // Set up deletion handlers for customers
    const customersTable = document.getElementById('customers-table');
    if (customersTable) {
        customersTable.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const customerId = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this customer?')) {
                    deleteCustomer(customerId);
                }
            }
        });
        console.log('Table action handlers set up');
    } else {
        console.error('Customers table not found');
    }
}); 