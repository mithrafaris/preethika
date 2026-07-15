$("#userdetails").submit(function (event) {
            event.preventDefault();
            var unindexed_array = $(this).serializeArray();
            var data = {};
            $.map(unindexed_array, function (n, i) {
              data[n["name"]] = n["value"];
            });
          
            console.log(data);
            var id = data.id; // Get the 'id' from the form data
            var request = {
              url: `http://localhost:3000/api/users/${id}`, // Removed the "?" at the end
              method: "put",
              data: data,
            };
            $.ajax(request).done(function (response) {
              alert("Data updated successfully!");
            });
          });
          
          if (window.location.pathname == "/userdetails") {
            console.log("coming in if condition");
            $ondelete = $(".table tbody td a.delete");
            console.log($ondelete);
            $ondelete.click(function () {
              var id = $(this).attr("data-id");
              var request = {
                url: `http://localhost:3000/api/users/${id}`,
                method: "delete",
              };
              // Use a modal or custom dialog for confirmation instead of confirm
              if (confirm("Do you really want to delete this record?")) {
                $.ajax(request).done(function (response) {
                  alert("Data deleted successfully");
                  location.reload();
                });
              }
            });
          }
          