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
    monaco.editor.setModelLanguage(editor.getModel(), "c");
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
    editor.updateOptions({'theme': THEMES[theme]})
  });

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
      }, function(err, doc) {
        window.current = doc._id;
        addSnippettoView(doc);
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
      }, {}, function(err, doc) {
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

})();
