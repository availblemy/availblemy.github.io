setImmediate(()=> {
addre=Module.findExportByName("kernel32.dll","IsDebuggerPresent");
Interceptor.attach(addre,{onLeave(retval){
retval.replace(ptr(0));
}})
})