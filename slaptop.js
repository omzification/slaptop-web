// Declare constants
var map;
var marker;
const os = {};



let errorMessageDisplayed = false;

function errorMessage(error) {
  if (!errorMessageDisplayed) {
    const errorPage = '<p class="error">uh oh. something went wrong :(</p><p class="error">' + error + '</p>';
    $('div').remove(); 
    $('nav').remove();
    $('body').append(errorPage);
    errorMessageDisplayed = true;
  }
  else {
    const errorPage = '<p class="error">' + error + '</p>';
    $('body').append(errorPage); 
  }
}


// Initialize

initSlaptop();
initNavbar();
initMap();
initCam();
showLoadingDots();


function initMap() {
  map = L.map('map').setView([0, 0], 1);

  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    edgeBufferTiles: 1,
  }).addTo(map);

  $('#info').dialog({
    modal: true,
    autoOpen: false,
    maxHeight: 500,
    minWidth: 300,
    title: "info",
    dialogClass: "pic-info",
    resizable: false,
    drag: function (event, ui) {
      var desktopOffset = $("#desktop").offset();
      var desktopWidth = $("#desktop").outerWidth();
      var desktopHeight = $("#desktop").outerHeight();
      var navHeight = $('nav').outerHeight();
      var dialogWidth = $(`.wallpapers`).outerWidth();
      var dialogHeight = $(`.wallpapers`).outerHeight();
      var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
      var dialogOffsetTop = ui.offset.top - desktopOffset.top;
      var maxDialogOffsetLeft = desktopWidth - dialogWidth;
      var maxDialogOffsetTop = desktopHeight - dialogHeight;
      if (dialogOffsetLeft < 0) {
        ui.position.left = desktopOffset.left;
      } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
        ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
      }
      if (dialogOffsetTop < 0) {
        ui.position.top = desktopOffset.top;
      } else if (dialogOffsetTop > maxDialogOffsetTop) {
        ui.position.top = desktopOffset.top + maxDialogOffsetTop;
      }

    },
  });
}

function initCam() {
  $('#cam').dialog({
    resizable: false,
    autoOpen: false,
    maxHeight: 500,
    minWidth: 300,
    title: "cam",
    dialogClass: "cam",
    drag: function (event, ui) {
      var desktopOffset = $("#desktop").offset();
      var desktopWidth = $("#desktop").outerWidth();
      var desktopHeight = $("#desktop").outerHeight();
      var navHeight = $('nav').outerHeight();
      var dialogWidth = $(`.wallpapers`).outerWidth();
      var dialogHeight = $(`.wallpapers`).outerHeight();
      var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
      var dialogOffsetTop = ui.offset.top - desktopOffset.top;
      var maxDialogOffsetLeft = desktopWidth - dialogWidth;
      var maxDialogOffsetTop = desktopHeight - dialogHeight;
      if (dialogOffsetLeft < 0) {
        ui.position.left = desktopOffset.left;
      } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
        ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
      }
      if (dialogOffsetTop < navHeight) {
        ui.position.top = desktopOffset.top + navHeight;
      } else if (dialogOffsetTop > maxDialogOffsetTop) {
        ui.position.top = desktopOffset.top + maxDialogOffsetTop;
      }

    },
  });
}

// Initialize slaptop
async function initSlaptop() {
  await Promise.all([fetchSlaptopData(), fetchFlickrData()]);
  console.log("All data fetched successfully :D", os);
  // call functions to combine data and display on page
  removeLoadingAnimation();
  loadWallpapers();
  loadPages();
  loadProjects();
  loadPics();
}

function removeLoadingAnimation() {
  $('#loadingAnimation').remove();
  $('#desktop').removeClass('loading');
  $('nav').removeClass('loading');
}

function showLoadingDots() {
  /**If element not found, do nothing*/
  if (!$("#loadingDots").length > 0) return false;

  var showDots = setInterval(function () {
    var dots = $("#loadingDots");
    dots.text().length >= 3 ? dots.text('') : dots.append('.');
  }, 300);
}

function openFolder(folder) {
  $(".folder-" + folder).dialog("open");
}

function openPage(page) {
  $(".content-" + page).dialog("open");
}

function openPic(pic) {
  $(".pic-" + pic).dialog("open");
}

// Initialize navbar
function initNavbar() {
  // Add event listener to navbar items
  $(".nav-item").on("click", function () {
    $(".nav-item").not($(this)).removeClass("nav-item--open");
    $(this).toggleClass("nav-item--open");
  });

  // Add event listener to body
  $("body").on("click", function (event) {
    $(".nav-item--open").removeClass("nav-item--open");
    $("nav").on("click", function (event) {
      event.stopPropagation();
    });
  });
}

// Fetch slaptop data
async function fetchSlaptopData() {
  try {
    const response = await fetch("slaptop.json");
    if (!response.ok) {
      console.log(response)
      throw new Error(response.status + `(${response.statusText}) (${response.url})`);
    }
    const data = await response.json();
    os.slaptop = data;
    console.log("Local slaptop data fetched successfully :)");
  } catch (error) {
    console.error("Failed to fetch slaptop data - ", error);
    errorMessage("Failed to fetch slaptop data - " + error);
  }
}

// Fetch Flickr data
async function fetchFlickrData() {
  try {
    const response = await fetch('https://slaptop-functions.azurewebsites.net/api/flickr', {
      method: 'get'
    });
    if (!response.ok) {
      console.log(response)
      throw new Error(response.status + `(${response.statusText}) (${response.url})`);
    }
    const data = await response.json();
    os.slaptop.pics = data;
    console.log("Flickr data fetched successfully :)");
  } catch (error) {
    console.error("Failed to fetch flickr data - ", error);
    errorMessage("Failed to fetch flickr data - " + error);
  }
}

// Load Wallpapers
async function loadWallpapers() {
  const wallpapers = os.slaptop.wallpapers;
  const dialog = $("<div></div>");
  dialog
    .dialog({
      autoOpen: false,

      minWidth: 300,
      title: "wallpapers",
      dialogClass: "wallpapers",
      show: {
        effect: "scale",
        duration: 500,
      },
      position: { my: "center", at: "center", of: "#desktop", collision: "fit" },
      containment: "#desktop",
      draggable: true,
      drag: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var dialogWidth = $(`.wallpapers`).outerWidth();
        var dialogHeight = $(`.wallpapers`).outerHeight();
        var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
        var dialogOffsetTop = ui.offset.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
        }
        if (dialogOffsetTop < 0) {
          ui.position.top = desktopOffset.top ;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
        }

      },
      resize: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var navHeight = $('nav').outerHeight();
        var dialogWidth = ui.size.width;
        var dialogHeight = ui.size.height;
        var dialogOffsetLeft = ui.position.left - desktopOffset.left;
        var dialogOffsetTop = ui.position.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
        }
        if (dialogOffsetTop < 0) {
          ui.position.top = desktopOffset.top;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
        }

      },
      resizeStop: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var dialogWidth = ui.size.width;
        var dialogHeight = ui.size.height;
        var dialogOffsetLeft = ui.position.left - desktopOffset.left;
        var dialogOffsetTop = ui.position.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
          ui.size.width = ui.size.width + dialogOffsetLeft;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          ui.size.width = ui.size.width - (dialogOffsetLeft - maxDialogOffsetLeft);
        }
        if (dialogOffsetTop < 0) {
          ui.position.top = desktopOffset.top;
          ui.size.height = ui.size.height + dialogOffsetTop;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          ui.size.height = ui.size.height - (dialogOffsetTop - maxDialogOffsetTop);
        }
        $(this).dialog("option", "position", ui.position);
        $(this).dialog("option", "height", ui.size.height);
        $(this).dialog("option", "width", ui.size.width);
      },
    })
    .addClass("folder-wallpapers");
  for (let index = 0; index < wallpapers.length; index++) {
    const wallpaper = wallpapers[index];
    const id = wallpaper.id;
    const icon = wallpaper.icon;
    const title = wallpaper.title;
    const folderIcon = $(
      '<div id="openWallpaper-' +
      id +
      '" class="folder-icon"><div><img src="' +
      icon +
      '"></div><span>' +
      title +
      "</span></div>"
    );
    dialog.append(folderIcon);
    var img = $(
      '<img id="wallpaper-' +
      wallpaper.id +
      '" class="wallpaper" src="' +
      wallpaper.src +
      '">'
    );

    $("wallpapers").append(img);
    $("#openWallpaper-" + wallpaper.id).on("click", function () {
      $("#wallpaper-" + wallpaper.id).toggleClass("wallpaper--open");
      $(".wallpaper")
        .not("#wallpaper-" + wallpaper.id)
        .removeClass("wallpaper--open");
    });
  }
}

// Load Pages
async function loadPages() {
  os.slaptop.pages.forEach((page) => {
    const title = page.title;
    const id = page.id;
    const content = $("<div></div>");
    fetch(page.src)
      .then((response) => response.text())
      .then((text) => {
        content.append(text);
      });

    dialog = $("<div></div>");
    dialog
      .dialog({
        autoOpen: false,
        maxHeight: 500,
        minWidth: 300,
        title: title,
        dialogClass: id,
        draggable: true,
        drag: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var dialogWidth = $(`.wallpapers`).outerWidth();
          var dialogHeight = $(`.wallpapers`).outerHeight();
          var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
          var dialogOffsetTop = ui.offset.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top ;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }
  
        },
        resize: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var navHeight = $('nav').outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }
  
        },
        resizeStop: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
            ui.size.width = ui.size.width + dialogOffsetLeft;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
            ui.size.width = ui.size.width - (dialogOffsetLeft - maxDialogOffsetLeft);
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top;
            ui.size.height = ui.size.height + dialogOffsetTop;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
            ui.size.height = ui.size.height - (dialogOffsetTop - maxDialogOffsetTop);
          }
          $(this).dialog("option", "position", ui.position);
          $(this).dialog("option", "height", ui.size.height);
          $(this).dialog("option", "width", ui.size.width);
        },
        show: {
          effect: "scale",
          duration: 500,
        },
      })
      .addClass("content-" + id);
    dialog.append(content);
  });
}

// Load Projects

async function loadProjects() {
  os.slaptop.projects.forEach((project) => {
    const title = project.title;
    const id = project.id;
    const icon = project.icon;
    const src = project.src;
    const projIcon = $(
      '<div id="' +
      id +
      '-folder" class="folder-icon" onclick="openFolder(\'' +
      id +
      '\')"><div><img src="' + icon + '"></div><span>' +
      id +
      "</span></div>"
    );
    $(".content-proj").append(projIcon)

    const content = $("<div></div>");
    fetch(src)
      .then((response) => response.text())
      .then((text) => {
        content.append(text);
      }); 

    dialog = $("<div></div>");
    dialog
      .dialog({
        autoOpen: false,
        maxHeight: 500,
        minWidth: 300,
        title: title,
        dialogClass: id,
        draggable: true,
        drag: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var dialogWidth = $(`.wallpapers`).outerWidth();
          var dialogHeight = $(`.wallpapers`).outerHeight();
          var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
          var dialogOffsetTop = ui.offset.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top ;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }
  
        },
        resize: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var navHeight = $('nav').outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }
  
        },
        resizeStop: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
            ui.size.width = ui.size.width + dialogOffsetLeft;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
            ui.size.width = ui.size.width - (dialogOffsetLeft - maxDialogOffsetLeft);
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top;
            ui.size.height = ui.size.height + dialogOffsetTop;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
            ui.size.height = ui.size.height - (dialogOffsetTop - maxDialogOffsetTop);
          }
          $(this).dialog("option", "position", ui.position);
          $(this).dialog("option", "height", ui.size.height);
          $(this).dialog("option", "width", ui.size.width);
        },
        show: {
          effect: "scale",
          duration: 500,
        },
      })
      .addClass("folder-" + id);
    dialog.append(content);
  });
}

// Load Pics
async function loadPics() {
  const dialog = $("<div></div>");
  dialog
    .dialog({
      autoOpen: false,
      maxHeight: 500,
      minWidth: 300,
      title: "pics",
      dialogClass: "pics",
      show: {
        effect: "scale",
        duration: 500,
      },
      position: { my: "center", at: "center", of: "#desktop", collision: "fit" },
      containment: "#desktop",
      draggable: true,
      drag: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var navHeight = $('nav').outerHeight();
        var dialogWidth = $(`.pics`).outerWidth();
        var dialogHeight = $(`.pics`).outerHeight();
        var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
        var dialogOffsetTop = ui.offset.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
        }
        if (dialogOffsetTop < navHeight) {
          ui.position.top = desktopOffset.top + navHeight;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
        }
      },
      resize: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var navHeight = $('nav').outerHeight();
        var dialogWidth = ui.size.width;
        var dialogHeight = ui.size.height;
        var dialogOffsetLeft = ui.position.left - desktopOffset.left;
        var dialogOffsetTop = ui.position.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
        }
        if (dialogOffsetTop < navHeight) {
          ui.position.top = desktopOffset.top + navHeight;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
        }

      },
      resizeStop: function (event, ui) {
        var desktopOffset = $("#desktop").offset();
        var desktopWidth = $("#desktop").outerWidth();
        var desktopHeight = $("#desktop").outerHeight();
        var dialogWidth = ui.size.width;
        var dialogHeight = ui.size.height;
        var dialogOffsetLeft = ui.position.left - desktopOffset.left;
        var dialogOffsetTop = ui.position.top - desktopOffset.top;
        var maxDialogOffsetLeft = desktopWidth - dialogWidth;
        var maxDialogOffsetTop = desktopHeight - dialogHeight;
        if (dialogOffsetLeft < 0) {
          ui.position.left = desktopOffset.left;
          ui.size.width = ui.size.width + dialogOffsetLeft;
        } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
          ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          ui.size.width = ui.size.width - (dialogOffsetLeft - maxDialogOffsetLeft);
        }
        if (dialogOffsetTop < 0) {
          ui.position.top = desktopOffset.top;
          ui.size.height = ui.size.height + dialogOffsetTop;
        } else if (dialogOffsetTop > maxDialogOffsetTop) {
          ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          ui.size.height = ui.size.height - (dialogOffsetTop - maxDialogOffsetTop);
        }
        $(this).dialog("option", "position", ui.position);
        $(this).dialog("option", "height", ui.size.height);
        $(this).dialog("option", "width", ui.size.width);
      },
    })
    .addClass("folder-pics");

  os.slaptop.pics.forEach((album) => {
    const title = album.title;
    const id = album.id;
    const description = album.description;
    const content = $(
      '<div id="' +
      id +
      '-folder" class="folder-icon" onclick="openFolder(\'' +
      id +
      '\')"><div><img src="/assets/icons/Folder.png"></div><span>' +
      title +
      "</span></div>"
    );

    dialog.append(content);

    const albumDialog = $('<div id="' + id + '"></div>');
    albumDialog
      .dialog({
        autoOpen: false,
        height: 500,
        minWidth: 300,
        title: title,
        dialogClass: id,
        maxHeight: $("#desktop").outerHeight() - $('nav').outerHeight(),
        position: { my: "center", at: "center", of: "#desktop", collision: "fit" },
        containment: "#desktop",
        draggable: true,
        drag: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var navHeight = $('nav').outerHeight();
          var dialogWidth = $(`.${id}`).outerWidth();
          var dialogHeight = $(`.${id}`).outerHeight();
          var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
          var dialogOffsetTop = ui.offset.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < navHeight) {
            ui.position.top = desktopOffset.top + navHeight;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }

        },
        resize: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var navHeight = $('nav').outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
          }
          if (dialogOffsetTop < navHeight) {
            ui.position.top = desktopOffset.top + navHeight;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
          }

        },
        resizeStop: function (event, ui) {
          var desktopOffset = $("#desktop").offset();
          var desktopWidth = $("#desktop").outerWidth();
          var desktopHeight = $("#desktop").outerHeight();
          var dialogWidth = ui.size.width;
          var dialogHeight = ui.size.height;
          var dialogOffsetLeft = ui.position.left - desktopOffset.left;
          var dialogOffsetTop = ui.position.top - desktopOffset.top;
          var maxDialogOffsetLeft = desktopWidth - dialogWidth;
          var maxDialogOffsetTop = desktopHeight - dialogHeight;
          if (dialogOffsetLeft < 0) {
            ui.position.left = desktopOffset.left;
            ui.size.width = ui.size.width + dialogOffsetLeft;
          } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
            ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
            ui.size.width = ui.size.width - (dialogOffsetLeft - maxDialogOffsetLeft);
          }
          if (dialogOffsetTop < 0) {
            ui.position.top = desktopOffset.top;
            ui.size.height = ui.size.height + dialogOffsetTop;
          } else if (dialogOffsetTop > maxDialogOffsetTop) {
            ui.position.top = desktopOffset.top + maxDialogOffsetTop;
            ui.size.height = ui.size.height - (dialogOffsetTop - maxDialogOffsetTop);
          }
          $(this).dialog("option", "position", ui.position);
          $(this).dialog("option", "height", ui.size.height);
          $(this).dialog("option", "width", ui.size.width);
        },
        show: {
          effect: "scale",
          duration: 500,
        },
      })
      .addClass("album folder-" + id);

    album.photos.forEach((photo) => {
      const img = "<img src=" + photo.url + ">";
      const geo = photo.geo.locality;
      const date = photo.date_taken;
      const pic =
        '<div id="' +
        photo.title +
        '-folder" class="card-pic" onclick="openPic(\'' +
        photo.id +
        '\')"><img src="' +
        photo.url +
        '"><span>' +
        photo.title +
        "</span></div>";

      $(albumDialog).append(pic);

      $("<div></div>")
        .dialog({
          autoOpen: false,
          resizable: false,
          title: photo.title,
          dialogClass: "dialog-pic " + photo.title,
          maxHeight: $("#desktop").outerHeight() - $('nav').outerHeight(),
          position: { my: "center", at: "center", of: "#desktop", collision: "fit" },
          containment: "#desktop",
          draggable: true,
          drag: function (event, ui) {
            var desktopOffset = $("#desktop").offset();
            var desktopWidth = $("#desktop").outerWidth();
            var desktopHeight = $("#desktop").outerHeight();
            var navHeight = $('nav').outerHeight();
            var dialogWidth = $(`.${photo.title}`).outerWidth();
            var dialogHeight = $(`.${photo.title}`).outerHeight();
            var dialogOffsetLeft = ui.offset.left - desktopOffset.left;
            var dialogOffsetTop = ui.offset.top - desktopOffset.top;
            var maxDialogOffsetLeft = desktopWidth - dialogWidth;
            var maxDialogOffsetTop = desktopHeight - dialogHeight;
            if (dialogOffsetLeft < 0) {
              ui.position.left = desktopOffset.left;
            } else if (dialogOffsetLeft > maxDialogOffsetLeft) {
              ui.position.left = desktopOffset.left + maxDialogOffsetLeft;
            }
            if (dialogOffsetTop < navHeight) {
              ui.position.top = desktopOffset.top + navHeight;
            } else if (dialogOffsetTop > maxDialogOffsetTop) {
              ui.position.top = desktopOffset.top + maxDialogOffsetTop;
            }

          },
          buttons: {
            prevpic: {
              class:
                "leftButton ui-button-icon-only ui-state-default leftButton-" +
                photo.id,
              text: "",
              click: function () {
                openPic(photo.context._prevphoto_id);
                $(".pic-" + photo.id).dialog("close");
              },
            },
            nextpic: {
              class:
                "rightButton ui-button-icon-only ui-state-default rightButton-" +
                photo.id,
              text: "",
              click: function () {
                openPic(photo.context._nextphoto_id);
                $(".pic-" + photo.id).dialog("close");
              },
            },
          },
        })
        .addClass("pic pic-" + photo.id)
        .append(img);

      if (photo.context._prevphoto_id === 0) {
        $(".leftButton-" + photo.id).attr("disabled", true);
      }
      if (photo.context._nextphoto_id === 0) {
        $(".rightButton-" + photo.id).attr("disabled", true);
      }

      $(
        '<span class="photo-caption">' +
        geo +
        ", <span>" +
        date +
        " </span></span>"
      ).insertBefore(".rightButton-" + photo.id);

      $(".leftButton").append(
        '<span class="ui-button-icon-primary ui-icon ui-icon-caret-1-w"></span>'
      );
      $(".rightButton").append(
        '<span class="ui-button-icon-primary ui-icon ui-icon-caret-1-e"></span>'
      );

      $("." + photo.title)
        .children(".ui-dialog-titlebar")
        .append(
          "<button class='info-" + photo.id + " ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-info' type='button' role='button' title='info'><span class='ui-button-icon-primary ui-icon ui-icon-info'></span></button>"
        );

      $(".info-" + photo.id).on("click", function () {
        loadInfo(photo)
      });

    });
  });
}

async function loadInfo(photo) {
  const info = $("#info");
  const exif = $("#exif");
  const geo = [];


  Object.entries(photo.geo).forEach(([key, value]) => {
    if (value != "") {
      geo.push(value);
    }
  });
  const popup = geo.join(",<br>");


  // Remove existing exif of the info container
  exif.empty();
  exif.append(`<div class="camera"><img class="exif-item-camera" title="Camera" src="/assets/icons/iPhone13Mini.png"><span>${photo.exif.Make},<br>${photo.exif.Model}</span></div>`)
  Object.entries(photo.exif).forEach(([key, value]) => {
    if (key != "Make" && key != "Model") { exif.append(`<div><img class="exif-item-illustration" title="${key}" src="/assets/icons/${key}.png"><span>${value}</span></div>`) }

  });

  // Remove the existing marker before creating a new one
  if (marker && map.hasLayer(marker)) {
    map.removeLayer(marker);
  }

  if (photo.geo) {
    marker = L.marker([photo.lat, photo.long]).addTo(map);
    map.setView([photo.lat, photo.long], 13);
  }

  marker.bindPopup(`<b>${popup}</b>`);


  info.dialog("open");


  // Force the map to redraw so that it displays properly in the dialog box
  setTimeout(() => map.invalidateSize(), 1);

}


// Camera setup function - returns a Promise so we have to call it in an async function
async function setupCamera() {
  // Find the video element on our HTML page
  video = document.getElementById('video');

  // Request the front-facing camera of the device
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      height: { ideal: 1920 },
      width: { ideal: 1920 },
    },
  });
  video.srcObject = stream;

  // Handle the video stream once it loads.
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

function drawWebcamContinuous() {
  ctx.drawImage(video, 0, 0);
  requestAnimationFrame(drawWebcamContinuous);
}

var canvas;
var ctx;

async function main() {
  // Set up front-facing camera
  await setupCamera();

  video.play()

  // Set up canvas for livestreaming
  canvas = document.getElementById('facecanvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx = canvas.getContext('2d');

  // Start continuous drawing function
  drawWebcamContinuous();
  repositionDialog('#cam');
  console.log("Camera setup done")
}

// Delay the camera request by a bit, until the main body has loaded
function openCam() {
  main();
  $('#cam').dialog("open");
}

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function repositionDialog(dialog) {
  var $dialog = $(dialog);
  $dialog.dialog("option", "position", { my: "center", at: "center", of: "#desktop" });
}

