import React, { useEffect, useState } from "react";
import textgears from "textgears-api";
import "./WritingMock.css";
import axios from "axios";
import { useSelector } from "react-redux";
const WritingMock = React.forwardRef((props, ref) =>  {
  let ques = props.question;
  const [questions, setQuestions] = useState(ques);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [data, setData] = useState();
  const [bad, setBad] = useState();
  const [better, setBetter] = useState();
  const [summary, setSummary] = useState("");
  const [spellingResponse, setSpellingResponse] = useState([]);
  const [grammerResponse, setGrammerResponse] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  let incorrectSpellingArr = [];

  const textgearsApi = textgears("KgTfFRqsmncThR0k", { language: "en-US" });
  const baseUrl = useSelector((state) => state.app.baseUrl);
  useEffect(()=>{
setQuestions(ques)
setSummary("")
  },[props.question])


    //#region calling child func from parent
  
  // Expose childFunction to parent via ref
  React.useImperativeHandle(ref, () => ({
    nextQuestionFromWritingMock,
  }));
  //#endregion

  const handleChange = (event) => {
    setSummary(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // You can handle the summary submission here, e.g., send to an API
    console.log("Submitted Summary:", summary);
    checkGrammarFunc();
    // // Clear the input after submission (optional)
    // setSummary('');
  };

  function checkGrammarFunc(params) {
    textgearsApi
      .checkGrammar(summary)
      .then((data) => {
        let arr = [];
        setData(data.response.errors);
        filterData(data.response.errors);
      })
      .catch((err) => {});
  }

  function filterData(data) {
    let badArr = [];
    let betterArr = [];

    data.map((d) => {
      badArr.push(<span>{d.bad}</span>);
      betterArr.push(<span>{d.better}</span>);
    });
    setBad(badArr);
    setBetter(betterArr);
  }
  function checkSpellingsOfWord(params) {
    axios
      // .get("http://localhost:5001/api/user/checkSpellings")
      .get(`${baseUrl}api/user/checkSpellings`)
      .then((d) => {
        console.log(d.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  function checkSpellingOfSummary() {
    axios
      .post(`${baseUrl}api/user/checkSummary`, { summary })
      .then((d) => {
        setSpellingResponse(d.data.spellingResult);
        setGrammerResponse(d.data.grammerResult[0].grammerMistakes);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  function spellingResponseFunc() {
    console.log("spellingresponsefrom func : ", spellingResponse);
    let res = [];
    if (spellingResponse.length != 0) {
      spellingResponse.incorrectSpelling.map((spelling) => {
        incorrectSpellingArr.push(<span>{spelling},</span>);
      });
      res.push(
        <div className="spellingResponseDiv">
          <h2>Spelling Data</h2>
          <p>Total Words : {spellingResponse.summaryLength}</p>
          <p>Correct words : {spellingResponse.spellingCheckCount}</p>
          <p>Incorrect words : {incorrectSpellingArr}</p>
        </div>
      );
    }

    return res;
  }

  function grammerResponseFunc(params) {
    console.log("spellingresponsefrom func : ", grammerResponse);
    let res = [];
    let gramMis = [];
    let replacements = [];
    let reps = []; //because mistake.replacements is an array and it may contain more than one value
    if (grammerResponse.length != 0) {
      grammerResponse.map((mistake) => {
        gramMis.push(<span>{mistake.error},</span>);
        mistake.replacements.map((rep) => {
          reps.push(<span>{rep} </span>);
        });
        replacements.push(
          <div className="repsDiv">
            <span>{reps},</span>
          </div>
        );
        reps = [];
      });
      res.push(
        <div className="spellingResponseDiv">
          <h2>Grammer Data</h2>
          <p>Mistakes : {gramMis}</p>
          <div className="repMainDiv">Replacements : {replacements}</div>
        </div>
      );
    }

    return res;
  }

  function calculateScore() {
    //For Words in summary
    let sc1 = 5 / 300;
    let wordCountScore = sc1 * spellingResponse.summaryLength;

    let sc = 5 / spellingResponse.summaryLength;
    let spellingScore = sc * spellingResponse.spellingCheckCount;

    let grammerScore =
      sc * (spellingResponse.summaryLength - grammerResponse.length);

    //Total
    let totalScoreVar = (wordCountScore + spellingScore + grammerScore) / 3;
    totalScoreVar = totalScoreVar.toFixed(1);
    setTotalScore(totalScoreVar);
    // Calculate total score out of 10
    // const totalScore = (spellingScore + grammarScore) * 1.0;
    // console.log(totalScore)
    // return totalScore;
  }

  const nextQuestionFromWritingMock = () => {
    return summary;
    // setCurrentQuestion(currentQuestion + 1);
  };
  function submitTest(params) {}
  return (
    <div className="writing-main-content-questions">
      {questions.heading !== "" ? (
        <div className="writing-main-content-QuestionsDiv">
          <p className="writing-main-content-QuestionsDiv-P">
            {questions.heading}
          </p>
        </div>
      ) : (
        <></>
      )}
      {questions.summary !== "" ? (
        <div className="writing-main-content-summary">
          <p>{questions.summary}</p>
        </div>
      ) : (
        <></>
      )}
      <div className="writing-main-content-textArea-Div">
        <textarea
          value={summary}
          onChange={handleChange}
          placeholder="Write your summary here..."
          rows={5}
          cols={40}
        />
        <br />
      </div>
    </div>
  );
})

export default WritingMock;
