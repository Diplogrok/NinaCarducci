function mauGallery(options) {
  var options = Object.assign({}, mauGallery.defaults, options);
  var tagsCollection = [];

  return document.querySelectorAll(".gallery").forEach(function (gallery) {
    mauGallery.methods.createRowWrapper(gallery);

    if (options.lightBox) {
      mauGallery.methods.createLightBox(
        gallery,
        options.lightboxId,
        options.navigation
      );
    }

    mauGallery.listeners(gallery, options);

    gallery.querySelectorAll(".gallery-item").forEach(function (item) {
      mauGallery.methods.responsiveImageItem(item);
      mauGallery.methods.moveItemInRowWrapper(item);
      mauGallery.methods.wrapItemInColumn(item, options.columns);

      var theTag = item.dataset.galleryTag;
      if (
        options.showTags &&
        theTag !== undefined &&
        tagsCollection.indexOf(theTag) === -1
      ) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      mauGallery.methods.showItemTags(
        gallery,
        options.tagsPosition,
        tagsCollection
      );
    }

    gallery.style.display = "block";
    gallery.style.opacity = 0;
    gallery.style.transition = "opacity 0.5s ease-in-out";
    setTimeout(function () {
      gallery.style.opacity = 1;
    }, 50);
  });
}

mauGallery.defaults = {
  columns: 3,
  lightBox: true,
  lightboxId: null,
  showTags: true,
  tagsPosition: "bottom",
  navigation: true,
};

mauGallery.listeners = function (gallery, options) {
  gallery.addEventListener("click", function (event) {
    var target = event.target;

    if (
      options.lightBox &&
      target.tagName === "IMG" &&
      target.classList.contains("gallery-item")
    ) {
      mauGallery.methods.openLightBox(target, options.lightboxId);
    }
  });

  gallery.addEventListener("click", function (event) {
    var target = event.target;

    if (target.classList.contains("nav-link")) {
      mauGallery.methods.filterByTag.call(target, options);
    }
  });

  gallery.addEventListener("click", function (event) {
    var target = event.target;

    if (target.classList.contains("mg-prev")) {
      mauGallery.methods.prevImage(options.lightboxId);
    } else if (target.classList.contains("mg-next")) {
      mauGallery.methods.nextImage(options.lightboxId);
    }
  });
};

mauGallery.methods = {
  createRowWrapper: function (element) {
    if (!element.children[0].classList.contains("row")) {
      var rowWrapper = document.createElement("div");
      rowWrapper.classList.add("gallery-items-row", "row");
      element.insertBefore(rowWrapper, element.firstChild);
    }
  },
  wrapItemInColumn: function (element, columns) {
    var columnClasses;

    if (typeof columns === "number") {
      columnClasses = "col-" + Math.ceil(12 / columns);
    } else if (typeof columns === "object") {
      columnClasses = [];

      for (var breakpoint in columns) {
        columnClasses.push(
          `col-${breakpoint}-${Math.ceil(12 / columns[breakpoint])}`
        );
      }

      columnClasses = columnClasses.join("");
    } else {
      console.error(
        "Columns should be defined as numbers or objects. " +
          typeof columns +
          " is not supported."
      );
      return;
    }

    var columnWrapper = document.createElement("div");
    columnWrapper.className = "item-column mb-4 " + columnClasses;
    element.parentNode.insertBefore(columnWrapper, element);
    columnWrapper.appendChild(element);
  },
  moveItemInRowWrapper: function (element) {
    var rowWrapper = element.closest(".gallery-items-row");
    if (rowWrapper) {
      rowWrapper.appendChild(element);
    }
  },
  responsiveImageItem: function (element) {
    if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
    }
  },
  openLightBox: function (element, lightboxId) {
    document.querySelector(
      "#" + (lightboxId ? lightboxId : "galleryLightbox") + " .lightboxImage"
    ).src = element.src;
    $("#" + (lightboxId ? lightboxId : "galleryLightbox")).modal("show");
  },
  prevImage: function (lightboxId) {
    var activeImage = document.querySelector(".lightboxImage");
    var activeTag = document.querySelector(".tags-bar .active-tag").dataset
      .imagesToggle;
    var imagesCollection = mauGallery.methods.getImagesCollection(activeTag);

    var index = 0;
    imagesCollection.forEach(function (image, i) {
      if (image.src === activeImage.src) {
        index = i - 1;
      }
    });

    var prevImage =
      imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
    activeImage.src = prevImage.src;
  },
  nextImage: function (lightboxId) {
    var activeImage = document.querySelector(".lightboxImage");
    var activeTag = document.querySelector(".tags-bar .active-tag").dataset
      .imagesToggle;
    var imagesCollection = mauGallery.methods.getImagesCollection(activeTag);

    var index = 0;
    imagesCollection.forEach(function (image, i) {
      if (image.src === activeImage.src) {
        index = i + 1;
      }
    });

    var nextImage = imagesCollection[index] || imagesCollection[0];
    activeImage.src = nextImage.src;
  },
  createLightBox: function (gallery, lightboxId, navigation) {
    var lightboxHtml =
      '<div class="modal fade" id="' +
      (lightboxId ? lightboxId : "galleryLightbox") +
      '" tabindex="-1" role="dialog" aria-hidden="true">' +
      '<div class="modal-dialog" role="document">' +
      '<div class="modal-content">' +
      '<div class="modal-body">' +
      (navigation
        ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
        : '<span style="display:none;" />') +
      '<img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>' +
      (navigation
        ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
        : '<span style="display:none;" />') +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    gallery.insertAdjacentHTML("beforeend", lightboxHtml);
  },
  showItemTags: function (gallery, position, tagsCollection) {
    var tagItems =
      '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
    tagsCollection.forEach(function (tag) {
      tagItems +=
        '<li class="nav-item active">' +
        '<span class="nav-link" data-images-toggle="' +
        tag +
        '">' +
        tag +
        "</span></li>";
    });

    var tagsRow =
      '<ul class="my-4 tags-bar nav nav-pills">' + tagItems + "</ul>";
    if (position === "bottom") {
      gallery.insertAdjacentHTML("beforeend", tagsRow);
    } else if (position === "top") {
      gallery.insertAdjacentHTML("afterbegin", tagsRow);
    } else {
      console.error("Unknown tags position: " + position);
    }
  },
  filterByTag: function () {
    if (this.classList.contains("active-tag")) {
      return;
    }

    document
      .querySelector(".tags-bar .active-tag")
      .classList.remove("active-tag");

    this.classList.add("active-tag");

    var tag = this.dataset.imagesToggle;
    var galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach(function (item) {
      var itemColumn = item.closest(".item-column");
      itemColumn.style.display = "none"; // Hide all columns initially

      if (tag === "all" || item.dataset.galleryTag === tag) {
        itemColumn.style.display = "block"; // Show matching columns
      }
    });
  },
  getImagesCollection: function (tag) {
    var galleryItems = document.querySelectorAll(".gallery-item");
    var filteredItems = Array.from(galleryItems).filter(function (item) {
      return tag === "all" || item.dataset.galleryTag === tag;
    });

    return filteredItems.map(function (item) {
      return {
        src: item.querySelector("img").src,
        alt: item.querySelector("img").alt,
      };
    });
  },
};
