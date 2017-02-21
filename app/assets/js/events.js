(() => {
  let snippet = require("../lib/snippet");

  let THEMES = {
    'light': 'vs',
    'dark': 'vs-dark',
    'high contrast': 'hc-black'
  }

  //Render the list of stored snippet-list
  snippet.getAll((err, documents) => {
    for(let doc of documents) {
      addSnippettoView(doc);
    }
    window.current = null;
  })

  //Add all languages to the filter language select element
  //Listening for window event emitted by monaco loader, after being loaded.
  window.addEventListener("message", (e) => {
    if (e.data == "monaco_loaded") {
      monaco.languages.getLanguages().forEach((lang) => {
        //adding to filter language select
        jQuery("#language-filter").append(`<option>${lang.id}</option`);
        //adding to language changer
        jQuery("#language-changer").append(`<option>${lang.id}</option`);
      })
    }
    //Caching the previous response of theme change and incorporating it
    let cachedTheme = localStorage.getItem("monaco_theme");
    let cachedThemeName = localStorage.getItem("monaco_vis_theme");
    let tabSize = localStorage.getItem("monaco_tab");
    if (cachedTheme != null && cachedTheme != "") {
      editor.updateOptions({'theme': cachedTheme});
      jQuery("#theme-changer").val(cachedThemeName);
    }
    //Set tabsize by default
    editor.getModel().updateOptions({'tabSize': tabSize});
  })



  //On click of snippet in the list -> view it
  //Get the details from the database with id & display details
  let renderSnippet = (id) => {
    snippet.get({"_id" : id}, (err, document) => {
      let doc = document[0];
      jQuery("#snippet-title").val(doc.snippetTitle);
      jQuery("#snippet-desc").val(doc.snippetDesc)
      jQuery("#language-changer").val(doc.snippetLang);
      editor.setValue(doc.snippetCode);
      monaco.editor.setModelLanguage(editor.getModel(), doc.snippetLang);
    });
  }

  //New snippet actions
  //Set current to null, thus assuming a new snippet
  //Empty all values
  let newSnippet = () => {
    jQuery("#snippet-title").val("");
    jQuery("#snippet-desc").val("");
    editor.setValue("");
    monaco.editor.setModelLanguage(editor.getModel(), "plaintext");
    jQuery("#language-changer").val("plaintext");
    window.current = null;
  }

  //Add the snippet to the left snippet list pane
  let addSnippettoView = (doc) => {
    let date = "";
    if(doc.timeStamp != null) {
      date = doc.timeStamp.split("T")[0];
    }
    jQuery("#snippet-list").append(`
      <li class="list-group-item nav-group-item">
        <div id=${doc._id}>
          <strong>${doc.snippetTitle}</strong>
          <small class="pull-right">${doc.snippetLang}</small>
          <p>${doc.snippetDesc}</p>
          <small class="pull-right">${date}</small>
        </div>
      </li>`);
  }

  //Event listener for snippet click in the left snippet pane
  jQuery("#snippet-list").on("click", (e) => {
    jQuery("#snippet-list .active").removeClass("active")
    //Clicked on elsewere
    if (e.target.id == "") {
      jQuery(e.target).parent().parent().addClass('active');
      renderSnippet(jQuery(e.target).parent().attr("id"));
      window.current = jQuery(e.target).parent().attr("id");
    }
    //Clicked on div
    else {
      jQuery(e.target).parent().addClass('active');
      renderSnippet(e.target.id);
      window.current = e.target.id;
    }
  });

  //Change language of monaco on language change
  jQuery("#language-changer").on("change", () => {
    let language = jQuery("#language-changer").val();
    monaco.editor.setModelLanguage(editor.getModel(), language);
  });

  //Change theme of monaco on theme change
  jQuery("#theme-changer").on("change", () => {
    let theme = jQuery("#theme-changer").val();
    editor.updateOptions({'theme': THEMES[theme]});
    //Saving the theme state
    //Can be used for setting by default during next app start
    localStorage.setItem("monaco_theme", THEMES[theme]);
    localStorage.setItem("monaco_vis_theme", theme);
  });

  //Change tabsize of monaco on tab change
  jQuery("#tabsize-changer").on("change", (e) => {
    let tab = jQuery(e.currentTarget).val();
    editor.getModel().updateOptions({'tabSize': tab});
    //Saving the tab state
    //Can be used for setting by default during next app start
    localStorage.setItem("monaco_tab", tab);
  })

  //Event listener for new snippet
  jQuery("#snippet-new").on("click", () => {
    newSnippet();
  });

  //Event listener for save snippet
  jQuery("#snippet-save").on("click", () => {
    //Get all snippet details
    let code = editor.getValue();
    let lang = jQuery("#language-changer").val();
    let title = jQuery("#snippet-title").val();
    let desc = jQuery("#snippet-desc").val();

    //Finding if its a new snippet (or) saved snippet
    //window.current is the determinant variable
    //if null => new snippet
    //if not null => saved snippet (window.current has database id)
    if (window.current == null) {
      //New snippet
      //Therefore storing as a new snippet
      snippet.store({
        snippetCode: code,
        snippetLang: lang,
        snippetTitle: title,
        snippetDesc: desc,
        timeStamp: new Date().toISOString()
      }, (err, doc) => {
        window.current = doc._id;
        //Add to the left snippet list pane only if the filter is 'all' or snippet language
        if (jQuery("#language-filter").val() == "all" || jQuery("#language-filter").val() == lang) {
          addSnippettoView(doc);
        }
      });
    }
    else {
      //Saved snippet
      //Therefore updating the existing snippet with new values
      snippet.update({
        _id: window.current
      },
      {
        snippetCode: code,
        snippetLang: lang,
        snippetTitle: title,
        snippetDesc: desc,
        timeStamp: new Date().toISOString()
      }, {}, (err, doc) => {
        // Updating the view of the snippet in the left pane
        let date = new Date().toISOString().split("T")[0];
        jQuery(`#${window.current}`).html(`
          <strong>${title}</strong>
          <small class="pull-right">${lang}</small>
          <p>${desc}</p>
          <small class="pull-right">${date}</small>
        `)
      });
    }
  });

  //Event listener for delete snippet
  jQuery("#snippet-delete").on("click", () => {
    //Remove snippet from database
    snippet.remove({_id: window.current}, (err, numRemoved) => {
      //Remove snippet from the list
      jQuery(`#${window.current}`).parent().remove();
      newSnippet();
    });
  });

  //Event listener for snippet filter by language
  jQuery("#language-filter").on("change", (e) => {
    let lang = jQuery(e.currentTarget).val();
    let query = {};
    if (lang != "all") {
      query = {snippetLang: lang};
    }
    snippet.get(query, (err, docs) => {
      jQuery("#snippet-list").html("");
      docs.forEach((doc) => {
        addSnippettoView(doc);
      });
    });
  });

})();
