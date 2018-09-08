;(function($B){

    $B.stdlib = {}
    var pylist = ['VFS_import','__future__','_abcoll','_codecs','_collections','_collections_abc','_contextvars','_csv','_dummy_thread','_functools','_imp','_io','_markupbase','_py_abc','_pydecimal','_random','_socket','_sre','_string','_strptime','_struct','_sysconfigdata','_testcapi','_thread','_threading_local','_warnings','_weakref','_weakrefset','abc','antigravity','argparse','atexit','base64','bdb','binascii','bisect','calendar','cmath','cmd','code','codecs','codeop','colorsys','configparser','contextlib','contextvars','copy','copyreg','csv','dataclasses','datetime','decimal','difflib','doctest','enum','errno','external_import','fnmatch','formatter','fractions','functools','gc','genericpath','getopt','gettext','glob','heapq','imp','inspect','io','ipaddress','itertools','keyword','linecache','locale','marshal','numbers','opcode','operator','optparse','os','pdb','pickle','platform','posix','posixpath','pprint','profile','pwd','pydoc','queue','re','reprlib','select','shutil','signal','site','site-packages.__future__','site-packages.docs','site-packages.header','site-packages.test_sp','socket','sre_compile','sre_constants','sre_parse','stat','string','struct','subprocess','sys','sysconfig','tarfile','tempfile','test.namespace_pkgs.module_and_namespace_package.a_test','textwrap','this','threading','time','timeit','token','tokenize','traceback','turtle','types','typing','uuid','warnings','weakref','webbrowser','zipfile','zlib']
    for(var i = 0; i < pylist.length; i++){$B.stdlib[pylist[i]] = ['py']}
    
    var js = ['_ajax','_base64','_jsre','_multiprocessing','_posixsubprocess','_profile','_sre_utils','_svg','_sys','aes','builtins','dis','hashlib','hmac-md5','hmac-ripemd160','hmac-sha1','hmac-sha224','hmac-sha256','hmac-sha3','hmac-sha384','hmac-sha512','json','long_int','math','md5','modulefinder','pbkdf2','rabbit','rabbit-legacy','random','rc4','ripemd160','sha1','sha224','sha256','sha3','sha384','sha512','tripledes']
    for(var i = 0; i < js.length; i++){$B.stdlib[js[i]] = ['js']}
    
    var pkglist = ['asyncio','browser','collections','concurrent','concurrent.futures','encodings','html','http','importlib','jqueryui','logging','multiprocessing','multiprocessing.dummy','pydoc_data','site-packages.simpleaio','site-packages.ui','test','test.encoded_modules','test.leakers','test.namespace_pkgs.not_a_namespace_pkg.foo','test.support','test.test_email','test.test_importlib','test.test_importlib.builtin','test.test_importlib.extension','test.test_importlib.frozen','test.test_importlib.import_','test.test_importlib.source','test.test_json','test.tracedmodules','unittest','unittest.test','unittest.test.testmock','urllib','xml','xml.etree','xml.parsers','xml.sax']
    for(var i  =0; i < pkglist.length; i++){$B.stdlib[pkglist[i]] = ['py', true]}
    })(__BRYTHON__)