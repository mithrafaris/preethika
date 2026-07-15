const catElements = document.querySelectorAll('.cat');
catElements.forEach(cat => {
    cat.addEventListener('click', () => {
        let catId = cat.getAttribute('data-catid');
        console.log(catId);
        $.ajax({
            method: 'POST',
            url: '/filter-cat',
            data: { catId: catId },
            success: function(response) {
                console.log("AJAX POST request to /filter-cat was successful!");
                console.log("Response:", response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Products filtered successfully!',
                });
                // Handle the response accordingly, for example, updating the UI
            },
            error: function(error) {
                console.error("AJAX POST request to /filter-cat failed:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                });
                // Handle the error accordingly
            }
        });
    });
});
