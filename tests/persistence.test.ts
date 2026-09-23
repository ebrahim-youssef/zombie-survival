import {afterEach,describe,expect,it,vi} from "vitest";
import {LocalSettingsStore} from "../src/persistence/LocalSettingsStore";
function mockStorage(initial:string|null=null):void{
  let value=initial;
  vi.stubGlobal("window",{localStorage:{
    getItem:()=>value,
    setItem:(_key:string,input:string)=>{value=input;},
  }});
}
afterEach(()=>vi.unstubAllGlobals());
describe("local persistence",()=>{
  it("falls back when saved data is corrupt",()=>{
    mockStorage("{not-json");
    const data=new LocalSettingsStore().load();
    expect(data.version).toBe(1);
    expect(data.settings).toMatchObject({masterVolume:.65,mobileAimMode:"stick-auto-fire"});
  });
  it("migrates older saved settings non-destructively",()=>{
    mockStorage(JSON.stringify({version:1,highScore:90,highestRound:2,
      settings:{masterVolume:.5,mouseSensitivity:1,damageNumbers:true}}));
    const d=new LocalSettingsStore().load();
    expect(d.highScore).toBe(90);
    expect(d.settings.mobileAimMode).toBe("stick-auto-fire");
  });
  it("clamps settings, records the best run and persists mobile mode",()=>{
    mockStorage();
    const store=new LocalSettingsStore();
    const saved=store.saveSettings({
      masterVolume:4,mouseSensitivity:.01,damageNumbers:true,
      mobileAimMode:"auto-aim",
    });
    expect(saved.settings).toEqual({masterVolume:1,mouseSensitivity:.25,
      damageNumbers:true,mobileAimMode:"auto-aim"});
    store.recordRun(800,5);
    store.recordRun(300,2);
    expect(store.load()).toMatchObject({
      highScore:800,highestRound:5,
      settings:{mobileAimMode:"auto-aim"},
    });
  });
});
