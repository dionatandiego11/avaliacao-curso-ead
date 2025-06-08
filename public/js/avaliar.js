// public/js/avaliar.js
document.addEventListener('DOMContentLoaded', () => {
    feather.replace(); // Initialize Feather Icons

    const emojis = {
        1: '😡',
        2: '😞',
        3: '😐',
        4: '😊',
        5: '😍'
    };

    const evaluationForm = document.getElementById('evaluationForm');
    const commentInput = document.getElementById('comentario');
    const charCountSpan = document.getElementById('charCount');
    const previewBtn = document.getElementById('previewBtn');
    const submitBtn = document.getElementById('submitBtn');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const criterionInputs = ['conteudo', 'professores', 'apoio', 'estrutura', 'material', 'experiencia']
        .map(id => document.getElementById(id));

    const recommendationOptions = document.querySelectorAll('input[name="indicacao"]');

    function updateRating(criterion, value) {
        document.getElementById(criterion + 'Value').textContent = value;
        document.getElementById(criterion + 'Emoji').textContent = emojis[value];
        updateOverallRating();
    }

    function updateOverallRating() {
        let total = 0;
        criterionInputs.forEach(input => {
            total += parseInt(input.value);
        });
        const average = (total / criterionInputs.length).toFixed(1);
        document.getElementById('overallRating').textContent = average;
        document.getElementById('overallEmoji').textContent = emojis[Math.round(average)];
    }

    function updateRecommendation(value) {
        const yesBtn = document.getElementById('recommendYes');
        const noBtn = document.getElementById('recommendNo');
        const feedback = document.getElementById('recommendationFeedback');

        yesBtn.classList.remove('selected', 'yes');
        noBtn.classList.remove('selected', 'no');

        if (value === 'sim') {
            yesBtn.classList.add('selected', 'yes');
            feedback.className = 'mt-4 p-3 rounded-lg bg-green-100 border border-green-200';
            feedback.innerHTML = '<p class="font-medium text-green-800">✨ Ótimo! Sua recomendação ajudará outros estudantes!</p>';
        } else {
            noBtn.classList.add('selected', 'no');
            feedback.className = 'mt-4 p-3 rounded-lg bg-red-100 border border-red-200';
            feedback.innerHTML = '<p class="font-medium text-red-800">📝 Obrigado pelo feedback! Isso ajudará a melhorar a qualidade do ensino.</p>';
        }

        feedback.classList.remove('hidden');
    }

    // Event Listeners para sliders de avaliação
    criterionInputs.forEach(input => {
        input.addEventListener('input', () => updateRating(input.id, input.value));
    });

    // Event Listeners para recomendação (sim/não)
    recommendationOptions.forEach(radio => {
        radio.addEventListener('change', () => updateRecommendation(radio.value));
    });

    // Contador de caracteres do comentário
    commentInput.addEventListener('input', function () {
        const count = this.value.length;
        charCountSpan.textContent = count + '/500';
        if (count > 500) {
            this.value = this.value.substring(0, 500);
            charCountSpan.textContent = '500/500';
        }
    });

    // Botão de pré-visualização
    previewBtn.addEventListener('click', function () {
        const ratings = {};
        criterionInputs.forEach(input => {
            ratings[input.previousElementSibling.firstElementChild.textContent.trim()] = input.value;
        });

        const comment = commentInput.value;
        const overall = document.getElementById('overallRating').textContent;
        const recommendation = document.querySelector('input[name="indicacao"]:checked');

        let previewHTML = `<div class="font-semibold mb-2">Nota Geral: ${overall}/5.0</div>`;

        Object.entries(ratings).forEach(([criterion, value]) => {
            previewHTML += `<div class="flex justify-between"><span>${criterion}:</span><span>${value}/5 ${emojis[value]}</span></div>`;
        });

        if (recommendation) {
            const recommendText = recommendation.value === 'sim' ? 'Sim, recomendo! ✅' : 'Não recomendo ❌';
            previewHTML += `<div class="mt-3 font-semibold">Recomendação: ${recommendText}</div>`;
        }

        if (comment.trim()) {
            previewHTML += `<div class="mt-4 p-3 bg-white rounded border-l-4 border-blue-500"><strong>Comentário:</strong><br>${comment}</div>`;
        }

        previewContent.innerHTML = previewHTML;
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Envio do formulário
    evaluationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const selectedRecommendation = document.querySelector('input[name="indicacao"]:checked');
        if (!selectedRecommendation) {
            alert('Por favor, selecione se você indicaria este curso.');
            return;
        }

        loadingOverlay.style.display = 'flex';

        const formData = {
            conteudo: parseInt(document.getElementById('conteudo').value),
            professores: parseInt(document.getElementById('professores').value),
            apoio: parseInt(document.getElementById('apoio').value),
            estrutura: parseInt(document.getElementById('estrutura').value),
            material: parseInt(document.getElementById('material').value),
            experiencia: parseInt(document.getElementById('experiencia').value),
            comentario: commentInput.value.trim() || null
        };

        const currentEvaluationId = evaluationForm.dataset.evaluationId;
        const method = currentEvaluationId ? 'PUT' : 'POST';
        const url = currentEvaluationId ? `/api/avaliacoes/${currentEvaluationId}` : '/api/avaliar';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            loadingOverlay.style.display = 'none';

            if (response.ok) {
                const redirect = currentEvaluationId
                    ? '/my-evaluations?message=Avaliação atualizada com sucesso!'
                    : '/obrigado';
                window.location.href = redirect;
            } else {
                const errorData = await response.json();
                alert('Erro: ' + (errorData.message || 'Ocorreu um erro ao processar sua avaliação.'));
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            loadingOverlay.style.display = 'none';
            alert('Erro de conexão ou servidor. Tente novamente mais tarde.');
        }
    });

    // Botão "Salvar Rascunho"
    document.getElementById('saveDraftBtn').addEventListener('click', function () {
        const recommendation = document.querySelector('input[name="indicacao"]:checked');
        const draftData = {
            conteudo: document.getElementById('conteudo').value,
            professores: document.getElementById('professores').value,
            apoio: document.getElementById('apoio').value,
            estrutura: document.getElementById('estrutura').value,
            material: document.getElementById('material').value,
            experiencia: document.getElementById('experiencia').value,
            comentario: document.getElementById('comentario').value,
            indicacao: recommendation ? recommendation.value : null,
            timestamp: new Date().toISOString()
        };

        console.log('Rascunho salvo:', draftData);
        alert('Rascunho salvo! Você pode continuar sua avaliação mais tarde.');
    });

    // Carregar dados para edição da avaliação
    async function loadEvaluationForEdit(evaluationId) {
        try {
            const response = await fetch(`/api/avaliacoes/${evaluationId}`);
            if (!response.ok) throw new Error('Não foi possível carregar a avaliação para edição.');

            const data = await response.json();

            document.getElementById('conteudo').value = data.conteudo;
            document.getElementById('professores').value = data.professores;
            document.getElementById('apoio').value = data.apoio;
            document.getElementById('estrutura').value = data.estrutura;
            document.getElementById('material').value = data.material;
            document.getElementById('experiencia').value = data.experiencia;
            commentInput.value = data.comentario || '';

            criterionInputs.forEach(input => updateRating(input.id, input.value));
            commentInput.dispatchEvent(new Event('input'));

            evaluationForm.dataset.evaluationId = evaluationId;
            submitBtn.textContent = 'Atualizar Avaliação';
            submitBtn.innerHTML = '<i data-feather="upload" class="w-5 h-5 mr-2"></i> Atualizar Avaliação';

            document.title = 'Editar Avaliação - REAVALIE EAD';
            document.querySelector('.main-evaluation-h1').textContent = 'Edite sua Avaliação';

            feather.replace(); // Re-inicializar ícones após alteração no botão
        } catch (error) {
            console.error('Erro ao carregar avaliação para edição:', error);
            alert('Erro ao carregar avaliação para edição: ' + error.message);
        }
    }

    // Inicializar nota geral na primeira renderização
    updateOverallRating();
});
