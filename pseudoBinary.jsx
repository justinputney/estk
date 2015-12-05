/*
    Adds a "Export As Pseudo Binary" option to ESTK file menu
    Exports a JSX file with nested JSXBIN code, e.g.,
    eval('@JSXBIN@ES@2.0@MyBbyBn0ABJAnAEjzFjBjMjFjSjUBfRBFeEjUjFjTjUff0DzACByB');
    install in Apps/ESTK/package/Contents/SharedSupport/Required/extensions (create last folder)
*/
    

menus.file.exportAsPseudo = new MenuElement ("command", "$$$/ESToolkit/Menu/File/ExportAsPseudo=&Export as Pseudo Binary...","---at the end of file", "file/exportAsPseudo");

	menus.file.exportAsPseudo.onDisplay = function() {
		this.enabled = document && (document.langID == "js") && docMgr.isActiveDocumentWin();
	}

	menus.file.exportAsPseudo.onSelect = function() {
		if( app.modalState ) return;

		if( document && document.isSourceDocument )
			document.exportAsPseudoBinary();
	}

SourceDocument.prototype.exportAsPseudoBinary = function() {
    var s;

    // do not save non-documents or docs that are not JS
    if (!this.paneTitle || (this.langID != "js"))
	    return true;

	var f = null;

    if( !this.includePath || ( this.includePath && this.includePath.length == 0 ) )
    {
        f = new File( this.scriptID );
        
        if( f.exists )
			this.includePath = f.parent ? f.parent.absoluteURI : "/";
		else
			f = null;
    }

	if( !this.checkSyntax( this.includePath ) )
	    return false;
    try
    {
		s = app.compile( this.getText(), ( f ? f.absoluteURI : undefined ), this.includePath );
    }
    catch (e)
    {
	    return false;
    }

    if( !this.currentFolder )
        this.currentFolder = app.currentFolder;

    var pos = this.fileName.lastIndexOf ('.');
	
    if( pos < 0 )
	    pos = this.fileName.length;
		
    var proposedName = this.fileName.substr( 0, pos ) + ".jsx";
    var f = File( this.currentFolder );
    f.changePath( proposedName );
    f = f.saveDlg( localize( "$$$/ESToolkit/FileDlg/ExportAsPseudoBinary=Export To Pseudo Binary JavaScript" ),
			       localize( "$$$/ESToolkit/FileDlg/JSX=JavaScript files:*.jsx" ));
    if(f)
    {
        // remember the folder
        this.currentFolder = app.currentFolder = 
		    f.parent ? f.parent.absoluteURI : "/";

	    // If the file is read-only, abort
	    if (f.readonly)
	    {
		    var msg = _win
				    ? "$$$/ESToolkit/FileDlg/ProtectedWin=Could not save as %1 because the file is locked.^nUse the 'Properties' command in the Windows explorer to unlock the file."
				    : "$$$/ESToolkit/FileDlg/ProtectedMac=Could not save as %1 because the file is locked.^nUse the 'Get Info' command in the Finder to unlock the file.";
		    errorBox( localize( msg, decodeURIComponent( f.name ) ) );
		    return false;
	    }
	    if (f.open ("w"))
	    {
		    f.lineFeed = this.lf;
		    f.encoding = this.encoding;
		    f.write ("eval('" + s.replace(/\s+/igm, '\\\r') + "');");
		    f.close();
			
			try
			{
				// we are good citizen
				app.notifyFileChanged (f);
			}
			catch( exc )
			{}
	    }
	    if (f.error != "")
		    errorBox( localize( "$$$/ESToolkit/FileDlg/CannotWrite=Cannot write to file %1!", decodeURIComponent( f.name ) ) );
	    else
		    return true;
    }
    return false;
}
